import express from "express";
import { Book } from "../models/bookModel.js";
import { Client } from '@elastic/elasticsearch';


const router = express.Router();

const client = new Client({ node: 'http://localhost:9200' });


router.post("/", async (request, response) => {
  try {
    if (
      !request.body.title ||
      !request.body.author ||
      !request.body.publishYear ||
      !request.body.isbn ||
      !request.body.description
    ) {
      return response.status(400).send({
        message: "Send all required fields!",
      });
    }

    const newBook = {
      title: request.body.title,
      author: request.body.author,
      publishYear: request.body.publishYear,
      isbn: request.body.isbn,
      description: request.body.description
    };

    const book = await Book.create(newBook);

    try {
      const { body } = await client.index({
        index: 'books',
        body: {
          title: book.title,
          author: book.author,
          publicationYear: book.publishYear,
          isbn: book.isbn,
          description: book.description,
        },
      });
      console.log('Indexed document:', body);
    } catch (error) {
      console.error('Error indexing document:', error);
    }

    return response.status(201).send(book);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

router.get("/", async (request, response) => {
  try {
    const books = await Book.find({});
    return response.status(200).json({
      count: books.lenght,
      data: books,
    });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

router.get("/:id", async (request, response) => {
  try {
    const { id } = request.params;

    const book = await Book.findById(id);
    return response.status(200).json(book);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

router.put("/:id", async (request, response) => {
  try {
    if (
      !request.body.title ||
      !request.body.author ||
      !request.body.publishYear ||
      !request.body.isbn ||
      !request.body.description
    ) {
      return response.status(400).send({
        message: "Send all required fields!",
      });
    }

    const { id } = request.params;

    const result = await Book.findByIdAndUpdate(id, request.body);

    if (!result) {
      return response.status(404).json({ message: "Book not found!" });
    }

    try {
      const updatedBook = await Book.findById(id);
  
      const { body } = await client.index({
        index: 'books',
        id: id,
        body: {
          title: updatedBook.title,
          author: updatedBook.author,
          publicationYear: updatedBook.publishYear,
          isbn: updatedBook.isbn,
          description: updatedBook.description,
        },
      });
  
      console.log('Updated document in Elasticsearch:', body);
    } catch (error) {
      console.error('Error updating document in Elasticsearch:', error);
    }

    return response.status(200).json({ message: "Book updated successfully!" });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

router.delete("/:id", async (request, response) => {
  try {
    const { id } = request.params;

    const result = await Book.findByIdAndDelete(id);

    if (!result) {
      return response.status(404).json({ message: "Book not found!" });
    }

    try {
      const { body } = await client.delete({
        index: 'books',
        id: id,
      });
  
      console.log('Deleted document from Elasticsearch:', body);
    } catch (error) {
      console.error('Error deleting document from Elasticsearch:', error);
    }

    return response.status(200).json({ message: "Book deleted successfully!" });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

router.get("/search", async (request, response) => {
  const { query } = request.query;

  try {
    const results = await searchBooks(query);
    return response.status(200).json({ results });
  } catch (error) {
    console.error('Error searching for books:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
});

const searchBooks = async (query) => {
  try {
    const { body } = await client.search({
      index: 'books',
      body: {
        query: {
          multi_match: {
            query: query,
            fields: ['title', 'author', 'description'],
          },
        },
      },
    });
    return body.hits.hits.map(hit => hit._source);
  } catch (error) {
    console.error('Error searching for books:', error);
    return [];
  }
};

export default router;
