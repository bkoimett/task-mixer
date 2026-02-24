package main

import (
    "context"
    "log"
    "time"
    "task-mixer/handlers"

    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Database

func main() {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
    if err != nil {
        log.Fatal(err)
    }

    DB = client.Database("taskbridge")
    handlers.Init(DB)

    r := gin.Default()
    r.Use(cors.New(cors.Config{
        AllowOrigins: []string{"http://localhost:5173"},
        AllowMethods: []string{"GET", "POST", "PUT"},
        AllowHeaders: []string{"Content-Type"},
    }))

    // Routes
    r.GET("/api/tasks", handlers.GetTasks)
    r.POST("/api/tasks/seed", handlers.SeedTasks)
    r.POST("/api/applications", handlers.CreateApplication)
    r.POST("/api/sync/batch", handlers.BatchSync)  // ← key endpoint

    r.Run(":8080")
}