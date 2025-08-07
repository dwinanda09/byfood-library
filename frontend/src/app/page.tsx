'use client';
import React, { useState } from 'react';
import { BookProvider, useBooks } from '../contexts/BookContext';
import { BookForm } from '../components/BookForm';
import { Book } from '../types/book';

const Dashboard = () => {
  const { books, loading, error, addBook, updateBook, deleteBook } = useBooks();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [viewingBook, setViewingBook] = useState<Book | null>(null);
  
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'year' | 'created_at' | 'updated_at'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('');

  const handleAddBook = async (book: Book) => {
    await addBook(book);
    setIsFormOpen(false);
  };

  const handleUpdateBook = async (book: Book) => {
    if (editingBook?.id) {
      await updateBook(editingBook.id, book);
      setEditingBook(null);
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (confirm('Are you sure you want to delete this book?')) {
      await deleteBook(id);
    }
  };

  const filteredAndSortedBooks = React.useMemo(() => {
    let filtered = books.filter(book => {
      const matchesSearch = searchTerm === '' || 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesYear = yearFilter === '' || book.year.toString() === yearFilter;
      
      return matchesSearch && matchesYear;
    });

    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'author':
          aVal = a.author.toLowerCase();
          bVal = b.author.toLowerCase();
          break;
        case 'year':
          aVal = a.year;
          bVal = b.year;
          break;
        case 'created_at':
          aVal = new Date(a.created_at || 0).getTime();
          bVal = new Date(b.created_at || 0).getTime();
          break;
        case 'updated_at':
          aVal = new Date(a.updated_at || 0).getTime();
          bVal = new Date(b.updated_at || 0).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return filtered;
  }, [books, searchTerm, yearFilter, sortBy, sortOrder]);

  const handleSort = (field: typeof sortBy) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: typeof sortBy) => {
    if (field !== sortBy) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading books...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Book Library</h1>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Add New Book
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            Error: {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by title or author
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter search term..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by year
              </label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All years</option>
                {[...new Set(books.map(book => book.year))].sort((a, b) => b - a).map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort by
              </label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as typeof sortBy);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="author-asc">Author (A-Z)</option>
                <option value="author-desc">Author (Z-A)</option>
                <option value="year-asc">Year (Oldest first)</option>
                <option value="year-desc">Year (Newest first)</option>
                <option value="created_at-desc">Recently added</option>
                <option value="updated_at-desc">Recently updated</option>
              </select>
            </div>
          </div>
          
          {(searchTerm || yearFilter) && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {filteredAndSortedBooks.length} of {books.length} books
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setYearFilter('');
                }}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow">
          {books.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No books found. Add your first book to get started!
            </div>
          ) : filteredAndSortedBooks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No books match your search criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('title')}
                    >
                      Title {getSortIcon('title')}
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('author')}
                    >
                      Author {getSortIcon('author')}
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('year')}
                    >
                      Year {getSortIcon('year')}
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('created_at')}
                    >
                      Created {getSortIcon('created_at')}
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('updated_at')}
                    >
                      Updated {getSortIcon('updated_at')}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAndSortedBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{book.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{book.author}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{book.year}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {book.created_at ? new Date(book.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {book.updated_at ? new Date(book.updated_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => setViewingBook(book)}
                          className="px-2 py-1 text-sm bg-secondary text-white rounded hover:bg-slate-600"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setEditingBook(book)}
                          className="px-2 py-1 text-sm bg-primary text-white rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => book.id && handleDeleteBook(book.id)}
                          className="px-2 py-1 text-sm bg-error text-white rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <BookForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleAddBook}
          title="Add New Book"
        />

        <BookForm
          isOpen={!!editingBook}
          onClose={() => setEditingBook(null)}
          onSubmit={handleUpdateBook}
          book={editingBook}
          title="Edit Book"
        />

        {viewingBook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">Book Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <p className="text-gray-900">{viewingBook.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Author</label>
                  <p className="text-gray-900">{viewingBook.author}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <p className="text-gray-900">{viewingBook.year}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="text-gray-900">
                    {viewingBook.created_at ? new Date(viewingBook.created_at).toLocaleString() : 'Not available'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="text-gray-900">
                    {viewingBook.updated_at ? new Date(viewingBook.updated_at).toLocaleString() : 'Not available'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingBook(null)}
                className="mt-4 w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <BookProvider>
      <Dashboard />
    </BookProvider>
  );
}