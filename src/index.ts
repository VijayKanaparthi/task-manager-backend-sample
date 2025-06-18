import "reflect-metadata"

import express, { Request, Response } from "express"
import cors from "cors"
import dotenv from "dotenv"
import { AppDataSource } from "./data-source"
import { Task } from "./entity/Task"

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())

AppDataSource.initialize()
  .then(() => {
    console.log("📦 Connected to PostgreSQL")

    const taskRepository = AppDataSource.getRepository(Task)

    // GET /tasks - List all tasks
    app.get("/tasks", async (_req: Request, res: Response) => {
      try {
        const tasks = await taskRepository.find()
        res.json(tasks)
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch tasks", details: err })
      }
    })

    // POST /tasks - Create a new task
    app.post("/tasks", async (req: Request, res: Response) => {
      try {
        const { title, description, status, dueDate } = req.body
        const task = taskRepository.create({
          title,
          description,
          status,
          dueDate,
        })
        const result = await taskRepository.save(task)
        res.status(201).json(result)
      } catch (err) {
        res.status(400).json({ error: "Failed to create task", details: err })
      }
    })

    // PUT /tasks/:id - Update a task
    // app.put("/tasks/:id", async (req: Request, res: Response) => {
    //   try {
    //     const { id } = req.params
    //     const task = await taskRepository.findOneBy({ id })

    //     if (!task) return res.status(404).json({ msg: "Task not found" })

    //     taskRepository.merge(task, req.body)
    //     const result = await taskRepository.save(task)
    //     res.json(result)
    //   } catch (err) {
    //     res.status(400).json({ error: "Failed to update task", details: err })
    //   }
    // })

    // DELETE /tasks/:id - Delete a task
    // app.delete("/tasks/:id", async (req: Request, res: Response) => {
    //   try {
    //     const result = await taskRepository.delete(req.params.id)
    //     if (result.affected === 0)
    //       return res.status(404).json({ msg: "Task not found" })
    //     res.sendStatus(204)
    //   } catch (err) {
    //     res.status(400).json({ error: "Failed to delete task", details: err })
    //   }
    // })

    // Start server
    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error("❌ Failed to connect to DB", err)
  })
