package handlers

import (
    "context"
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo"
    "task-mixer/models"
)

var db *mongo.Database

func Init(database *mongo.Database) {
    db = database
}

func GetTasks(c *gin.Context) {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    cursor, err := db.Collection("tasks").Find(ctx, bson.M{})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    var tasks []models.Task
    cursor.All(ctx, &tasks)
    if tasks == nil {
        tasks = []models.Task{}
    }

    c.JSON(http.StatusOK, tasks)
}

func SeedTasks(c *gin.Context) {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    seeds := []interface{}{
        models.Task{Title: "Design a flyer", BusinessName: "Mama Pima Salon", Category: "Design", Description: "Create a promotional flyer for our new hair treatment packages. Size A5, bright colours.", SkillsRequired: []string{"Canva", "Design"}, PayRange: "KES 500-800", Deadline: time.Now().Add(72 * time.Hour), CreatedAt: time.Now()},
        models.Task{Title: "Write product descriptions", BusinessName: "Kariuki Phone Repair", Category: "Writing", Description: "Write 10 short product descriptions for our most repaired phone models. SEO friendly.", SkillsRequired: []string{"Writing", "SEO"}, PayRange: "KES 300-500", Deadline: time.Now().Add(48 * time.Hour), CreatedAt: time.Now()},
        models.Task{Title: "Instagram content for 1 week", BusinessName: "Zuri Boutique", Category: "Social Media", Description: "Plan and create 7 Instagram posts with captions for our clothing store. Include hashtags.", SkillsRequired: []string{"Social Media", "Photography"}, PayRange: "KES 1000-1500", Deadline: time.Now().Add(96 * time.Hour), CreatedAt: time.Now()},
        models.Task{Title: "Data entry - customer list", BusinessName: "Baraka Hardware", Category: "Admin", Description: "Type up a handwritten customer list (about 200 entries) into a Google Sheet.", SkillsRequired: []string{"Typing", "Excel"}, PayRange: "KES 400-600", Deadline: time.Now().Add(24 * time.Hour), CreatedAt: time.Now()},
        models.Task{Title: "WhatsApp catalogue setup", BusinessName: "Njoki Groceries", Category: "Digital", Description: "Set up our WhatsApp Business catalogue with 30 products, photos and prices.", SkillsRequired: []string{"WhatsApp Business", "Admin"}, PayRange: "KES 600-900", Deadline: time.Now().Add(60 * time.Hour), CreatedAt: time.Now()},
    }

    db.Collection("tasks").InsertMany(ctx, seeds)
    c.JSON(http.StatusOK, gin.H{"seeded": len(seeds)})
}

func BatchSync(c *gin.Context) {
    // Receives array of queued actions from client
    var actions []struct {
        Action  string      `json:"action"`
        Payload interface{} `json:"payload"`
        ClientTS int64     `json:"client_ts"`
    }

    if err := c.ShouldBindJSON(&actions); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    results := []gin.H{}
    for _, a := range actions {
        results = append(results, gin.H{
            "action": a.Action,
            "status": "synced",
            "server_ts": time.Now().UnixMilli(),
        })
    }

    c.JSON(http.StatusOK, gin.H{"synced": len(actions), "results": results})
}