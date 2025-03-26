import { use, useActionState, useRef } from "react";
import { BookManage, BookManageJson, BookState } from "./domain/book";
import "./App.css";

async function fetchManageBook() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const response = await fetch("http://localhost:8080/books");
  const data: BookManageJson[] = await response.json();
  return data.map((book) => new BookManage(book.id, book.name, book.status));
}

const fetchManageBookPromise = fetchManageBook();

function App() {
  const initialBooks = use(fetchManageBookPromise);
  const addFormRef = useRef<HTMLFormElement>(null);
  const [bookState, updataBookState, isPending] = useActionState(
    async (
      prevState: BookState | undefined,
      formData: FormData
    ): Promise<BookState> => {
      if (!prevState) {
        throw new Error("Invalid state");
      }

      const name = formData.get("bookName") as string;

      if (!name) {
        throw new Error("Book name is required");
      }

      const response = await fetch("http://localhost:8080/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error("Failed to add book");
      }

      const newBook = await response.json();
      addFormRef.current?.reset();

      return {
        allBooks: [...prevState.allBooks, newBook],
      };
    },
    {
      allBooks: initialBooks,
    }
  );

  return (
    <>
      <div>
        <form action={updataBookState} ref={addFormRef}>
          <input type="text" name="bookName" placeholder="書籍名" />
          <button type="submit" disabled={isPending}>
            追加
          </button>
        </form>
        <div>
          <ul>
            {bookState.allBooks.map((book: BookManage) => {
              return <li key={book.id}>{book.name}</li>;
            })}
          </ul>
        </div>
      </div>
    </>
  );
}

export default App;
