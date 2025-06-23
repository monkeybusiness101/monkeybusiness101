// Reading List API endpoint for CRUD operations
// Uses Vercel KV for persistent storage

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // For now, we'll use simple file-based storage
    // In production, you'd want to use a proper database
    const { storageGet, storageSet } = await import('../../lib/storage.js');

    switch (req.method) {
      case 'GET':
        // Get all reading list items
        const items = await storageGet('reading-list') || [];
        res.status(200).json({ items });
        break;

      case 'POST':
        // Add new item
        const newItem = req.body;
        
        // Validate required fields
        if (!newItem.title || !newItem.url) {
          res.status(400).json({ error: 'Title and URL are required' });
          return;
        }

        // Add metadata
        newItem.id = Date.now().toString();
        newItem.addedDate = new Date().toISOString();
        newItem.isRead = false;

        const currentItems = await storageGet('reading-list') || [];
        const updatedItems = [newItem, ...currentItems];
        
        await storageSet('reading-list', updatedItems);
        res.status(201).json({ item: newItem });
        break;

      case 'PUT':
        // Update existing item
        const { id, ...updateData } = req.body;
        
        if (!id) {
          res.status(400).json({ error: 'Item ID is required' });
          return;
        }

        const itemsToUpdate = await storageGet('reading-list') || [];
        const itemIndex = itemsToUpdate.findIndex(item => item.id === id);
        
        if (itemIndex === -1) {
          res.status(404).json({ error: 'Item not found' });
          return;
        }

        // Update the item
        itemsToUpdate[itemIndex] = { ...itemsToUpdate[itemIndex], ...updateData };
        
        // Add readDate if marking as read
        if (updateData.isRead && !itemsToUpdate[itemIndex].readDate) {
          itemsToUpdate[itemIndex].readDate = new Date().toISOString();
        } else if (!updateData.isRead) {
          delete itemsToUpdate[itemIndex].readDate;
        }

        await storageSet('reading-list', itemsToUpdate);
        res.status(200).json({ item: itemsToUpdate[itemIndex] });
        break;

      case 'DELETE':
        // Delete item
        const { id: deleteId } = req.query;
        
        if (!deleteId) {
          res.status(400).json({ error: 'Item ID is required' });
          return;
        }

        const itemsToDelete = await storageGet('reading-list') || [];
        const filteredItems = itemsToDelete.filter(item => item.id !== deleteId);
        
        if (filteredItems.length === itemsToDelete.length) {
          res.status(404).json({ error: 'Item not found' });
          return;
        }

        await storageSet('reading-list', filteredItems);
        res.status(200).json({ message: 'Item deleted successfully' });
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Reading list API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 