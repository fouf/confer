package main

import (
	"github.com/gorilla/websocket"
	"fmt"
	"strconv"
	"time"
)

type Message struct {
	Username string
	Message string
	Time string
}

type User struct {
	Username string `json:"username"`
	id int
	conn *websocket.Conn
	chatID string
}

type Chat struct {
	ID int
	Name string
	Users map[string]*User `json:"users"`
	Messages []Message `json:"messages"`
}

var Users map[string]*User
var Chats map[string]*Chat
var chatID int

func addUser(user *User) {
	if Users == nil {
		Users = make(map[string]*User)
	}
	Users[strconv.Itoa(user.id)] = user
	println("User " + user.Username + " has come online")
	// Send them current public chats
	syncUser(Users[strconv.Itoa(user.id)])
}

func addChat(chat *Chat) {
	if Chats == nil {
		Chats = make(map[string]*Chat)
		chatID = 0
	}
	chat.Users = make(map[string]*User)
	chat.ID = chatID
	Chats[strconv.Itoa(chatID)] = chat
	chatID += 1
}
func userLeft(user *User) {
	for _, v := range Chats {
		delete(v.Users, strconv.Itoa(user.id))
	}
}

func joinChat(chatID string, user *User) {
	var ok bool
	room, ok := Chats[chatID]
	if !ok {
		return
	}
	for _, v := range Chats {
		delete(v.Users, strconv.Itoa(user.id))
	}

	user.chatID = chatID
	fmt.Println("User " + user.Username + " added to chat: " + chatID)

	room.Users[strconv.Itoa(user.id)] = user
	for _, v := range Users {
		syncUser(v)
	}
}
func handleMessage(user *User, message string) {
	if _, ok := Chats[user.chatID]; !ok {
		fmt.Errorf("Invalid chat id supplied by user")
		return
	}
	msg := Message{
		Username: user.Username,
		Message: message,
		Time: time.Now().Format("Jan 2, 15:04:05"),
	}
	msgs := Chats[user.chatID].Messages
	msgs = append(msgs, msg)
	Chats[user.chatID].Messages = msgs
	for _, v := range Users {
		syncUser(v)
	}

}

func syncUser(user *User) {
	chatJSON := struct {
		Type string `json:"type"`
		Chats map[string]*Chat `json:"chats"`
	}{
		Type: "chats",
		Chats: Chats,
	}
	if err := user.conn.WriteJSON(chatJSON); err != nil {
		fmt.Errorf("Unable to write JSON to client.")
	}
}
