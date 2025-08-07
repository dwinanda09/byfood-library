'use client';
import React, { useState, useEffect } from 'react';
import { Book } from '../types/book';

interface BookFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (book: Book) => Promise<void>;
  book?: Book | null;
  title: string;
}

export const BookForm: React.FC<BookFormProps> = ({
  isOpen, onClose, onSubmit, book, title
}) => {
  const [formData, setFormData] = useState<Book>({
    title: '',
    author: '',
    year: new Date().getFullYear(),
  });
  const [errors, setErrors] = useState<Partial<Book>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (book) {
      setFormData(book);
    } else {
      setFormData({ title: '', author: '', year: new Date().getFullYear() });
    }
    setErrors({});
  }, [book, isOpen]);

  const validate = () => {
    const newErrors: Partial<Book> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.author.trim()) newErrors.author = 'Author is required';
    if (formData.year < 1000 || formData.year > new Date().getFullYear() + 10) {
      newErrors.year = 'Please enter a valid year';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.title ? 'border-error' : 'border-gray-300'
              }`}
              placeholder="Enter book title"
            />
            {errors.title && <p className="text-error text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Author *
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.author ? 'border-error' : 'border-gray-300'
              }`}
              placeholder="Enter author name"
            />
            {errors.author && <p className="text-error text-sm mt-1">{errors.author}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year *
            </label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.year ? 'border-error' : 'border-gray-300'
              }`}
              placeholder="Enter publication year"
            />
            {errors.year && <p className="text-error text-sm mt-1">{errors.year}</p>}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Saving...' : book ? 'Update' : 'Add'} Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};