package main

import (
	"crypto/rand"
	"encoding/hex"
	"database/sql"
	"time"
	"encoding/json"
	"fmt"
	"errors"
	"github.com/dimfeld/httptreemux"
	_ "github.com/go-sql-driver/mysql"
	"golang.org/x/crypto/bcrypt"
	"net/http"
	"github.com/gorilla/websocket"
	"regexp"
	"strconv"
)

var db *sql.DB
var isAlphaNumeric = regexp.MustCompile(`^[a-zA-Z0-9]{6,16}$`).MatchString

type tokenInfo struct {
	token string
	userId int
}
type UserInfo struct {
	username string
	userId int
}
type jsonRecv struct {
	Type string `json:"type"`
	Data string `json:"data"`
}
func getUserInfo(token string) (UserInfo, error) {

	var ui UserInfo
	ret, res := checkToken(token)

	if !ret {
		println("Invalid token " + token)
		return ui, errors.New("Invalid token")
	}
	ui.userId = res.userId
	err := db.QueryRow("SELECT username FROM users WHERE id = ?", res.userId).Scan(&ui.username)
	switch {
	case err != nil:
		println("userInfo db error: " + err.Error())
		return ui, errors.New("Error accessing DB")
	}

	return ui, nil
}
func userInfoHandler(w http.ResponseWriter, r *http.Request) {
	println("Info handler")
	type jsonInfo struct {
		Token string `json:"token"`
	}
	var ji jsonInfo
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&ji); err != nil {
		println("Error decoding token for user info")
		http.Error(w, "error-info", http.StatusInternalServerError)
	}
	ui, err := getUserInfo(ji.Token)
	if err != nil {
		println("bad token")
		http.Error(w, "invalid-token", http.StatusForbidden)
		return
	}
	jsonUserInfo := struct {
		Username string `json:"username"`
	}{
		Username: ui.username,
	}
	if err := json.NewEncoder(w).Encode(&jsonUserInfo); err != nil {
		http.Error(w, "user_info-failed", http.StatusInternalServerError)
		println("could not send user info json")
		return
	}
	println("User info sent")

}
func logoutHandler(w http.ResponseWriter, r *http.Request) {
	type jsonLogout struct {
		Token string `json:"token"`
	}
	var jl jsonLogout
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&jl); err != nil {
		println("Error decoding token for logout")
		http.Error(w, "error-logout", http.StatusInternalServerError)
		return
	}

	if _, err := db.Exec("DELETE from access_tokens WHERE access_token = ?", jl.Token); err != nil {
		println("Could not find access token: " + jl.Token + " error: " + err.Error())
		http.Error(w, "error-logout", http.StatusBadRequest)
		return
	}
	http.Error(w, "success-logout", http.StatusOK)
}
func registerHandler(w http.ResponseWriter, r *http.Request) {
	type jsonRegister struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	var jr jsonRegister
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&jr); err != nil {
		panic(err)
	}
	if (len(jr.Password) < 8 || len(jr.Password) > 64) || (len(jr.Username) > 16 || len(jr.Username) < 6) || !isAlphaNumeric(jr.Username) {
		http.Error(w, "Could not create account", http.StatusBadRequest)
		return
	}

	var user string
	err := db.QueryRow("SELECT username FROM users WHERE username=?", jr.Username).Scan(&user)

	switch {
	case err == sql.ErrNoRows:
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(jr.Password), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Could not create account", 500)
			return
		}
		println(jr.Username)
		_, err = db.Exec("INSERT INTO users(username, password) VALUES(?, ?)", jr.Username, hashedPassword)
		if err != nil {
			http.Error(w, "Could not create account", 500)
			println("db error")
			return
		}
		println("user added")
	case err != nil:
		http.Error(w, "Username taken", 400)
		return
	}
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	type jsonLogin struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	var jl jsonLogin
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&jl); err != nil {
		panic(err)
	}
	var dbPassword []byte
	var dbUserId int
	err := db.QueryRow("SELECT id, password FROM users WHERE username=?", jl.Username).Scan(&dbUserId, &dbPassword)

	switch {
	default:
		err := bcrypt.CompareHashAndPassword(dbPassword, []byte(jl.Password))
		if err != nil {
			http.Error(w, "login-failed", http.StatusForbidden)
			println("wrong password")
			return
		}
	case err == sql.ErrNoRows:
		http.Error(w, "login-failed", http.StatusForbidden)
		println("failed to find user")
		// user does not exist
		return
	case err != nil:
		http.Error(w, "login-failed", http.StatusForbidden)
		println("err != nil db error" + err.Error())
		return
	}

	var arr [20]byte
	_, err = rand.Read(arr[:])
	if err != nil {
		http.Error(w, "login-failed", http.StatusInternalServerError)
		println("rand read error")
		return
	}
	str := hex.EncodeToString(arr[:])

	_, err = db.Exec("INSERT INTO access_tokens(access_token, user_id, created_at, ip) VALUES(?, ?, UTC_TIMESTAMP, ?)", str, dbUserId, r.RemoteAddr)
	if err != nil {
		http.Error(w, "login-failed", http.StatusInternalServerError)
		println("insert token error: " + err.Error())
		return
	}
	jsonAuth := struct{
		Token string `json:"token"`
	}{
		Token: str,
	}

	if err := json.NewEncoder(w).Encode(&jsonAuth); err != nil {
		http.Error(w, "login-failed", http.StatusInternalServerError)
		println("could not send json")
		return
	}

	println(jl.Username + " signed in.")

}
func checkToken(token string) (bool, tokenInfo) {
	var ret tokenInfo
	ret.token = token
	var created time.Time
	err := db.QueryRow("SELECT user_id, created_at FROM access_tokens WHERE access_token = ?", token).Scan(&ret.userId, &created)
	switch {
	case err == sql.ErrNoRows: // no token, not signed in
		return false, ret
	case err != nil: // error
		return false, ret
	}
	// TODO check created time, invalidate EOL tokens

	return true, ret

}
func main() {
	var err error
	db, err = sql.Open("mysql", "root:*******@/table?parseTime=true")
	if err != nil {
		panic(err)
	}
	defer db.Close()

	globalChat1 := &Chat{
		Name: "Global Chat 1",
	}
	globalChat2 := 	&Chat{
		Name: "Global Chat 2",
	}
	randomChat := &Chat{
		Name: "Random Chat",
	}
	addChat(globalChat1)
	addChat(globalChat2)
	addChat(randomChat)

	mux := httptreemux.New()
	ctxGroup := mux.UsingContext()
	ctxGroup.POST("/api/user/info", userInfoHandler)
	ctxGroup.POST("/api/auth", loginHandler)
	ctxGroup.POST("/api/register", registerHandler)
	ctxGroup.POST("/api/logout", logoutHandler)
	webSocketHandler := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
	ctxGroup.GET("/api/ws", func(w http.ResponseWriter, r *http.Request) {
		var info tokenInfo
		var ret bool
		if ret, info = checkToken(r.URL.Query().Get("token")); !ret {
			fmt.Println("Non-authorized user rejected.")
			http.Error(w, "not authorized", http.StatusForbidden)
			return
		}
		var ui UserInfo

		var err error
		if ui, err = getUserInfo(info.token); err != nil {
			http.Error(w, "Bad token", http.StatusNotAcceptable)
			return
		}
		conn, err := webSocketHandler.Upgrade(w, r, nil)
		if err != nil {
			http.Error(w, "could not upgrade", http.StatusNotAcceptable)
			return
		}
		defer conn.Close()
		ourUser := &User {
			id: ui.userId,
			Username: ui.username,
			conn: conn,
			chatID: "-1",
		}
		addUser(ourUser)
		for {
			r := jsonRecv{}
			err := conn.ReadJSON(&r)
			if err != nil {
				fmt.Printf(err.Error())
				break
			}
			switch (r.Type) {
			case "join-chat":
				joinChat(r.Data, Users[strconv.Itoa(info.userId)])
			case "message":
				fmt.Printf("Received message: " + r.Data + " from " + ourUser.Username + "\n")
				handleMessage(ourUser, r.Data)
			}
		}
		userLeft(ourUser)
	})
	http.ListenAndServe(":8080", mux)
	println("end main")
}
