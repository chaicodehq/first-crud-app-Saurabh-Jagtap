import { Todo } from "../models/todo.model.js";

/**
 * TODO: Create a new todo
 * - Extract data from req.body
 * - Create todo in database
 * - Return 201 with created todo
 */
export async function createTodo(req, res, next) {
  try {
    // Your code here
    const { title, priority, tags, dueDate, completed } = req.body;
    if (!title) return res.status(400).json({ error: { message: "Title is required" } });

    const todo = await Todo.create({
      title,
      priority,
      tags,
      dueDate,
      completed,
    })

    return res.status(201).json(todo)
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: List todos with pagination and filters
 * - Support query params: page, limit, completed, priority, search
 * - Default: page=1, limit=10
 * - Return: { data: [...], meta: { total, page, limit, pages } }
 */
export async function listTodos(req, res, next) {
  try {
    // Your code here
    // if the user types ?page=-500 then we handle that by "|| 1 (fallback)" 
    // Here 10 is base 10 to convert the string into number
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    // Same logic as page but defaults to 10
    const limit = Math.max(Number.parseInt(req.query.limit, 10) || 10, 1);
    const { completed, priority, search } = req.query;

    const filter = {}

    // We want user to enter only boolean value
    // If user types ?completed=maybe, we ignore
    if (completed === "true" || completed === "false") {
      filter.completed = completed === "true" //This would return boolean and is stored in filter.completed
    }

    if (priority) {
      filter.priority = priority;
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const total = await Todo.countDocuments(filter)
    const pages = total === 0 ? 0 : Math.ceil(total / limit);
    const data = await Todo.find(filter)
      .sort({ createdAt: -1 })  // Get the latest entry in mongodb
      .skip((page - 1) * limit)  // This is offset calculation in mongodb
      .limit(limit);  // This is the limit of entries we want to fetch from mongodb

    return res.status(200).json({
      data,
      meta: {
        total,
        page,
        limit,
        pages,
      }
    })
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: Get single todo by ID
 * - Return 404 if not found
 */
export async function getTodo(req, res, next) {
  try {
    // Your code here
    const { id } = req.params;
    const todo = await Todo.findById(id)
    if (!todo) return res.status(404).json({ error: { message: "Todo Not found" } });

    return res.status(200).json(todo)
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: Update todo by ID
 * - Use findByIdAndUpdate with { new: true, runValidators: true }
 * - Return 404 if not found
 */
export async function updateTodo(req, res, next) {
  try {
    // Your code here
    const { id } = req.params;
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
    if (!updatedTodo) return res.status(404).json({ error: { message: "Todo Not found" } });
    return res.status(200).json(updatedTodo)
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: Toggle completed status
 * - Find todo, flip completed, save
 * - Return 404 if not found
 */
export async function toggleTodo(req, res, next) {
  try {
    // Your code here
    const { id } = req.params;
    const todo = await Todo.findById(id)
    if (!todo) {
      return res.status(404).json({ error: { message: "Todo not found" } });
    }
    todo.completed = !todo.completed
    await todo.save()

    return res.status(200).json(todo)
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: Delete todo by ID
 * - Return 204 (no content) on success
 * - Return 404 if not found
 */
export async function deleteTodo(req, res, next) {
  try {
    // Your code here
    const { id } = req.params;
    const deletedTodo = await Todo.findByIdAndDelete(id)
    if (!deletedTodo) return res.status(404).json({ error: { message: "Todo not found" } });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}
