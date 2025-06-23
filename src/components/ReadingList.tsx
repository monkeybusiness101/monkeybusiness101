import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  BookOpen, 
  ExternalLink, 
  Plus, 
  Trash2, 
  MessageSquare, 
  Calendar,
  CheckCircle2,
  Circle,
  Link as LinkIcon
} from 'lucide-react';

// TypeScript interfaces
interface ReadingItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  isRead: boolean;
  comment?: string;
  addedDate: string;
  readDate?: string;
  tags?: string[];
}

interface NewItemForm {
  title: string;
  url: string;
  description: string;
  tags: string;
}

export function ReadingList() {
  const [items, setItems] = useState<ReadingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  
  const [newItem, setNewItem] = useState<NewItemForm>({
    title: '',
    url: '',
    description: '',
    tags: ''
  });

  // Load reading list on component mount
  useEffect(() => {
    loadReadingList();
  }, []);

  const loadReadingList = async () => {
    try {
      // Use external API for persistence
      const API_BASE_URL = 'https://reading-2zgiq7sde-maxs-projects-89df4148.vercel.app'; // Your deployed API URL
      const response = await fetch(`${API_BASE_URL}/api/reading/items`);
      
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      } else {
        // Fallback to localStorage for development
        const stored = localStorage.getItem('readingList');
        if (stored) {
          setItems(JSON.parse(stored));
        }
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load from API, using localStorage:', err);
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem('readingList');
        if (stored) {
          setItems(JSON.parse(stored));
        }
        setLoading(false);
      } catch (localErr) {
        setError('Failed to load reading list');
        setLoading(false);
      }
    }
  };

  const API_BASE_URL = 'https://reading-2zgiq7sde-maxs-projects-89df4148.vercel.app'; // Your deployed API URL

  const saveToStorage = (updatedItems: ReadingItem[]) => {
    localStorage.setItem('readingList', JSON.stringify(updatedItems));
    setItems(updatedItems);
  };

  const addItem = async () => {
    if (!newItem.title || !newItem.url) {
      setError('Title and URL are required');
      return;
    }

    const itemData = {
      title: newItem.title,
      url: newItem.url,
      description: newItem.description || undefined,
      tags: newItem.tags ? newItem.tags.split(',').map(tag => tag.trim()) : undefined
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/reading/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });

      if (response.ok) {
        const { item } = await response.json();
        const updatedItems = [item, ...items];
        setItems(updatedItems);
        localStorage.setItem('readingList', JSON.stringify(updatedItems));
      } else {
        // Fallback to local storage
        const item: ReadingItem = {
          id: Date.now().toString(),
          title: newItem.title,
          url: newItem.url,
          description: newItem.description || undefined,
          isRead: false,
          addedDate: new Date().toISOString(),
          tags: newItem.tags ? newItem.tags.split(',').map(tag => tag.trim()) : undefined
        };
        const updatedItems = [item, ...items];
        saveToStorage(updatedItems);
      }
    } catch (err) {
      console.error('Failed to add item via API, using localStorage:', err);
      // Fallback to local storage
      const item: ReadingItem = {
        id: Date.now().toString(),
        title: newItem.title,
        url: newItem.url,
        description: newItem.description || undefined,
        isRead: false,
        addedDate: new Date().toISOString(),
        tags: newItem.tags ? newItem.tags.split(',').map(tag => tag.trim()) : undefined
      };
      const updatedItems = [item, ...items];
      saveToStorage(updatedItems);
    }
    
    setNewItem({ title: '', url: '', description: '', tags: '' });
    setShowAddForm(false);
    setError(null);
  };

  const toggleReadStatus = async (id: string) => {
    const item = items.find(item => item.id === id);
    if (!item) return;

    const updateData = {
      id,
      isRead: !item.isRead,
      readDate: !item.isRead ? new Date().toISOString() : undefined
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/reading/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const { item: updatedItem } = await response.json();
        const updatedItems = items.map(item => 
          item.id === id ? updatedItem : item
        );
        setItems(updatedItems);
        localStorage.setItem('readingList', JSON.stringify(updatedItems));
      } else {
        // Fallback to local update
        const updatedItems = items.map(item => 
          item.id === id 
            ? { 
                ...item, 
                isRead: !item.isRead,
                readDate: !item.isRead ? new Date().toISOString() : undefined
              }
            : item
        );
        saveToStorage(updatedItems);
      }
    } catch (err) {
      console.error('Failed to update item via API, using localStorage:', err);
      // Fallback to local update
      const updatedItems = items.map(item => 
        item.id === id 
          ? { 
              ...item, 
              isRead: !item.isRead,
              readDate: !item.isRead ? new Date().toISOString() : undefined
            }
          : item
      );
      saveToStorage(updatedItems);
    }
  };

  const updateComment = async (id: string, comment: string) => {
    const updateData = { id, comment: comment || undefined };

    try {
      const response = await fetch(`${API_BASE_URL}/api/reading/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const { item: updatedItem } = await response.json();
        const updatedItems = items.map(item => 
          item.id === id ? updatedItem : item
        );
        setItems(updatedItems);
        localStorage.setItem('readingList', JSON.stringify(updatedItems));
      } else {
        // Fallback to local update
        const updatedItems = items.map(item => 
          item.id === id ? { ...item, comment: comment || undefined } : item
        );
        saveToStorage(updatedItems);
      }
    } catch (err) {
      console.error('Failed to update comment via API, using localStorage:', err);
      // Fallback to local update
      const updatedItems = items.map(item => 
        item.id === id ? { ...item, comment: comment || undefined } : item
      );
      saveToStorage(updatedItems);
    }

    setEditingComment(null);
    setNewComment('');
  };

  const deleteItem = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reading/items?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const updatedItems = items.filter(item => item.id !== id);
        setItems(updatedItems);
        localStorage.setItem('readingList', JSON.stringify(updatedItems));
      } else {
        // Fallback to local deletion
        const updatedItems = items.filter(item => item.id !== id);
        saveToStorage(updatedItems);
      }
    } catch (err) {
      console.error('Failed to delete item via API, using localStorage:', err);
      // Fallback to local deletion
      const updatedItems = items.filter(item => item.id !== id);
      saveToStorage(updatedItems);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500">Loading reading list...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Item Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {showAddForm ? 'Add New Article' : 'Reading List Manager'}
          </CardTitle>
          {!showAddForm && (
            <CardDescription>
              {items.length} articles • {items.filter(item => !item.isRead).length} unread
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {!showAddForm ? (
            <Button onClick={() => setShowAddForm(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Article
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                                     <Input
                     placeholder="Article title"
                     value={newItem.title}
                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({...newItem, title: e.target.value})}
                   />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">URL *</label>
                                     <Input
                     placeholder="https://example.com/article"
                     value={newItem.url}
                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({...newItem, url: e.target.value})}
                   />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                                 <Textarea
                   placeholder="Brief description or notes"
                   value={newItem.description}
                   onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewItem({...newItem, description: e.target.value})}
                   rows={2}
                 />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <Input
                  placeholder="tech, productivity, design (comma separated)"
                  value={newItem.tags}
                  onChange={(e) => setNewItem({...newItem, tags: e.target.value})}
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <div className="flex gap-2">
                <Button onClick={addItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Article
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowAddForm(false);
                  setNewItem({ title: '', url: '', description: '', tags: '' });
                  setError(null);
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reading List */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No articles in your reading list yet.</p>
            <p className="text-gray-500 text-sm mt-1">Add your first article to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className={`transition-all ${item.isRead ? 'opacity-75' : ''}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleReadStatus(item.id)}
                        className="mt-0.5 p-1 h-auto"
                      >
                        {item.isRead ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </Button>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`font-semibold ${item.isRead ? 'line-through text-gray-500' : ''}`}>
                            {item.title}
                          </h3>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <LinkIcon className="h-3 w-3" />
                          <span>{extractDomain(item.url)}</span>
                          <span>•</span>
                          <Calendar className="h-3 w-3" />
                          <span>Added {formatDate(item.addedDate)}</span>
                          {item.readDate && (
                            <>
                              <span>•</span>
                              <span>Read {formatDate(item.readDate)}</span>
                            </>
                          )}
                        </div>
                        
                        {item.description && (
                          <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                        )}
                        
                        {item.tags && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {item.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {/* Comment Section */}
                        <div className="mt-3">
                          {editingComment === item.id ? (
                            <div className="space-y-2">
                              <Textarea
                                placeholder="Add your thoughts or notes..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => updateComment(item.id, newComment)}>
                                  Save
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => {
                                    setEditingComment(null);
                                    setNewComment('');
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              {item.comment ? (
                                <div className="bg-gray-50 rounded-md p-3 mb-2">
                                  <p className="text-sm text-gray-700">{item.comment}</p>
                                </div>
                              ) : null}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingComment(item.id);
                                  setNewComment(item.comment || '');
                                }}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                {item.comment ? 'Edit comment' : 'Add comment'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteItem(item.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 