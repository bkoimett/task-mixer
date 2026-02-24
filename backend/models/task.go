package models

import (
    "time"
    "go.mongodb.org/mongo-driver/bson/primitive"
)

type Task struct {
    ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    Title           string             `bson:"title" json:"title"`
    BusinessName    string             `bson:"business_name" json:"business_name"`
    Category        string             `bson:"category" json:"category"`
    Description     string             `bson:"description" json:"description"`
    SkillsRequired  []string           `bson:"skills_required" json:"skills_required"`
    PayRange        string             `bson:"pay_range" json:"pay_range"`
    Deadline        time.Time          `bson:"deadline" json:"deadline"`
    CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
}

type Application struct {
    ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    TaskID      string             `bson:"task_id" json:"task_id"`
    UserID      string             `bson:"user_id" json:"user_id"`
    AppliedAt   time.Time          `bson:"applied_at" json:"applied_at"`
    Status      string             `bson:"status" json:"status"`
    ClientTS    int64              `bson:"client_ts" json:"client_ts"`
} 