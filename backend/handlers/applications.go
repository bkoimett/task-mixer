package handlers

import (
    "context"
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
    "task-mixer/models"
    "go.mongodb.org/mongo-driver/bson/primitive"
)

func CreateApplication(c *gin.Context) {
	// Parse the Request body
    var app models.Application
    if err := c.ShouldBindJSON(&app); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

	// Set server-side fields
    app.ID = primitive.NewObjectID()
    app.AppliedAt = time.Now()
    app.Status = "pending"

	// Set up database context 
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

	// Save to db
    db.Collection("applications").InsertOne(ctx, app)
    c.JSON(http.StatusCreated, app)
}