import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './index.css';

// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';

// Sortable Command Card Component
function SortableCommandCard({ command, onEdit, onDelete, onCopy }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: command._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="command-card"
      {...attributes}
    >
      <div className="command-header">
        <div className="command-drag-handle" {...listeners}>
          <span className="drag-icon">⋮⋮</span>
          <div className="command-name">{command.name}</div>
        </div>
        <div className="command-actions">
          <button
            className="edit-btn"
            onClick={() => onEdit(command)}
            title="Edit command"
          >
            ✏️
          </button>
          <button
            className="delete-btn"
            onClick={() => onDelete(command._id)}
            title="Delete command"
          >
            🗑️
          </button>
          <button
            className="copy-btn"
            onClick={() => onCopy(command.generatedCommand || command.command)}
          >
            Copy
          </button>
        </div>
      </div>
      <div className="command-description">{command.description}</div>
      <div className="command-code">
        {command.generatedCommand || command.command}
      </div>
    </div>
  );
}

// Sortable Category Component
function SortableCategory({ 
  category, 
  onEdit, 
  onDelete, 
  isEditing, 
  onStartEdit, 
  onCancelEdit, 
  onSaveEdit 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category._id });

  const [editData, setEditData] = useState({
    name: category.name,
    type: category.type,
    description: category.description || ''
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    onSaveEdit(category._id, editData);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="category-edit-item"
      {...attributes}
    >
      <div className="category-drag-handle" {...listeners}>
        ⋮⋮
      </div>
      
      {isEditing ? (
        <div className="category-edit-form">
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData({...editData, name: e.target.value})}
            placeholder="Category name"
            className="form-input"
          />
          <input
            type="text"
            value={editData.type}
            onChange={(e) => setEditData({...editData, type: e.target.value})}
            placeholder="Category type"
            className="form-input"
          />
          <input
            type="text"
            value={editData.description}
            onChange={(e) => setEditData({...editData, description: e.target.value})}
            placeholder="Description (optional)"
            className="form-input"
          />
          <div className="edit-actions">
            <button className="btn-save" onClick={handleSave}>Save</button>
            <button className="btn-cancel" onClick={onCancelEdit}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="category-info">
          <div className="category-details">
            <strong>{category.name}</strong>
            <span className="category-type">({category.type})</span>
            {category.parentCategory && (
              <span className="parent-info">
                → Child of: {category.parentCategory.name}
              </span>
            )}
            {category.isDefault && <span className="default-badge">Default</span>}
          </div>
          <div className="category-actions">
            <button 
              className="btn-edit"
              onClick={() => onStartEdit(category._id)}
            >
              Edit
            </button>
            <button 
              className="btn-delete"
              onClick={() => onDelete(category._id)}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [activeCategory, setActiveCategory] = useState('General');
  const [domain, setDomain] = useState('');
  const [ipRange, setIpRange] = useState('');
  const [ports, setPorts] = useState('');
  const [filename, setFilename] = useState('');
  const [categories, setCategories] = useState([]);
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showEditCategories, setShowEditCategories] = useState(false);
  const [showAddCommand, setShowAddCommand] = useState(false);
  const [showEditCommand, setShowEditCommand] = useState(false);
  const [editingCommand, setEditingCommand] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState(new Set());

  // Form states
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'General',
    description: '',
    parentCategory: ''
  });

  const [newCommand, setNewCommand] = useState({
    name: '',
    command: '',
    description: '',
    category: '',
    phase: 'Reconnaissance',
    tags: ''
  });

  const phases = ['Reconnaissance', 'Scanning', 'Enumeration', 'Exploitation', 'Post-Exploitation', 'Reporting'];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeCategory) {
      fetchCommands();
    }
  }, [activeCategory]); // Only refetch when activeCategory changes, not on other state changes

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data);
      setLoading(false);
      setError('');
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const fetchCommands = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/commands`);
      const filteredCommands = response.data.filter(cmd => 
        cmd.category && cmd.category.type === activeCategory
      );
      setCommands(filteredCommands);
      setError('');
    } catch (err) {
      console.error('Error fetching commands:', err);
      setError('Failed to fetch commands: ' + (err.response?.data?.message || err.message));
    }
  };

  const generateCommands = async () => {
    // Check if at least one field is filled
    const hasInput = domain.trim() || ipRange.trim() || ports.trim() || filename.trim();
    
    if (!hasInput) {
      setError('Please enter at least one field (domain, IP, ports, or filename)');
      return;
    }

    try {
      // Do substitution locally for all currently displayed commands
      const updatedCommands = commands.map(cmd => {
        if (cmd.category && cmd.category.type === activeCategory) {
          let generatedCommand = cmd.command;
          
          // Replace placeholders only if the corresponding field is filled
          if (domain.trim()) {
            generatedCommand = generatedCommand.replace(/\{domain\}/g, domain.trim());
          }
          if (ipRange.trim()) {
            generatedCommand = generatedCommand.replace(/\{ip\/range\}/g, ipRange.trim());
          }
          if (ports.trim()) {
            generatedCommand = generatedCommand.replace(/\{ports\}/g, ports.trim());
          }
          if (filename.trim()) {
            generatedCommand = generatedCommand.replace(/\{filename\}/g, filename.trim());
          }
          
          return {
            ...cmd,
            generatedCommand
          };
        }
        return cmd;
      });
      
      setCommands(updatedCommands);
      setError('');
      setSuccess('Commands generated successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to generate commands');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess('Command copied to clipboard!');
      setTimeout(() => setSuccess(''), 2000);
    }).catch(() => {
      setError('Failed to copy to clipboard');
      setTimeout(() => setError(''), 2000);
    });
  };

  const handleAddCategory = async () => {
    try {
      if (!newCategory.name.trim()) {
        setError('Category name is required');
        return;
      }
      
      await axios.post(`${API_BASE_URL}/categories`, newCategory);
      setNewCategory({ name: '', type: 'General', description: '', parentCategory: '' });
      setShowAddCategory(false);
      fetchCategories();
      setError('');
      setSuccess('Category added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Failed to add category: ' + (err.response?.data?.message || err.message));
    }
  };

  // Helper functions for category management
  const getMainCategories = () => {
    return categories.filter(cat => !cat.parentCategory);
  };

  const getSubcategories = (parentId) => {
    return categories.filter(cat => cat.parentCategory && cat.parentCategory._id === parentId);
  };

  const toggleCategoryCollapse = (categoryId) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(categoryId)) {
      newCollapsed.delete(categoryId);
    } else {
      newCollapsed.add(categoryId);
    }
    setCollapsedCategories(newCollapsed);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_BASE_URL}/categories/${categoryId}`);
        fetchCategories();
        setSuccess('Category deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error('Error deleting category:', err);
        setError('Failed to delete category: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleEditCategory = async (categoryId, updatedData) => {
    try {
      await axios.put(`${API_BASE_URL}/categories/${categoryId}`, updatedData);
      fetchCategories();
      setEditingCategory(null);
      setSuccess('Category updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Failed to update category: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCategoryReorder = async (newOrder) => {
    try {
      const reorderData = newOrder.map((category, index) => ({
        id: category._id,
        order: index
      }));

      await axios.put(`${API_BASE_URL}/categories/reorder`, {
        categories: reorderData
      });

      fetchCategories();
      setSuccess('Categories reordered successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error reordering categories:', err);
      setError('Failed to reorder categories: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCategoryDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
    const oldIndex = sortedCategories.findIndex(cat => cat._id === active.id);
    const newIndex = sortedCategories.findIndex(cat => cat._id === over.id);
    
    const newOrder = arrayMove(sortedCategories, oldIndex, newIndex);
    handleCategoryReorder(newOrder);
  };

  const handleAddCommand = async () => {
    try {
      if (!newCommand.name.trim() || !newCommand.command.trim() || !newCommand.category) {
        setError('Name, command, and category are required');
        return;
      }
      
      const categoryId = categories.find(cat => cat.name === newCommand.category)?._id;
      if (!categoryId) {
        setError('Selected category not found');
        return;
      }

      // Find the highest order in the same phase and category
      const samePhaseCommands = commands.filter(cmd => 
        cmd.category._id === categoryId && cmd.phase === newCommand.phase
      );
      const maxOrder = samePhaseCommands.length > 0 
        ? Math.max(...samePhaseCommands.map(cmd => cmd.order || 0))
        : -1;
      
      const commandData = {
        ...newCommand,
        category: categoryId,
        tags: newCommand.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        order: maxOrder + 1
      };
      
      await axios.post(`${API_BASE_URL}/commands`, commandData);
      setNewCommand({
        name: '',
        command: '',
        description: '',
        category: '',
        phase: 'Reconnaissance',
        tags: ''
      });
      setShowAddCommand(false);
      fetchCommands();
      setError('');
      setSuccess('Command added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error adding command:', err);
      setError('Failed to add command: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditCommand = (command) => {
    setEditingCommand(command);
    setNewCommand({
      name: command.name,
      command: command.command,
      description: command.description,
      category: command.category.name,
      phase: command.phase,
      tags: command.tags.join(', ')
    });
    setShowEditCommand(true);
  };

  const handleUpdateCommand = async () => {
    try {
      if (!newCommand.name.trim() || !newCommand.command.trim() || !newCommand.category) {
        setError('Name, command, and category are required');
        return;
      }
      
      const categoryId = categories.find(cat => cat.name === newCommand.category)?._id;
      if (!categoryId) {
        setError('Selected category not found');
        return;
      }
      
      const commandData = {
        ...newCommand,
        category: categoryId,
        tags: newCommand.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };
      
      await axios.put(`${API_BASE_URL}/commands/${editingCommand._id}`, commandData);
      setNewCommand({
        name: '',
        command: '',
        description: '',
        category: '',
        phase: 'Reconnaissance',
        tags: ''
      });
      setShowEditCommand(false);
      setEditingCommand(null);
      fetchCommands();
      setError('');
      setSuccess('Command updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating command:', err);
      setError('Failed to update command: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteCommand = async (commandId) => {
    if (!window.confirm('Are you sure you want to delete this command?')) {
      return;
    }
    
    try {
      await axios.delete(`${API_BASE_URL}/commands/${commandId}`);
      fetchCommands();
      setSuccess('Command deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting command:', err);
      setError('Failed to delete command: ' + (err.response?.data?.message || err.message));
    }
  };

  // Fuzzy search functionality
  const fuzzySearch = (query, text) => {
    if (!query || !text) return 0;
    
    query = query.toLowerCase();
    text = text.toLowerCase();
    
    // Exact match gets highest score
    if (text.includes(query)) {
      return text === query ? 100 : 80;
    }
    
    // Calculate fuzzy match score
    let queryIndex = 0;
    let score = 0;
    const maxScore = query.length;
    
    for (let i = 0; i < text.length && queryIndex < query.length; i++) {
      if (text[i] === query[queryIndex]) {
        score++;
        queryIndex++;
      }
    }
    
    // Return percentage match
    return queryIndex === query.length ? (score / maxScore) * 60 : 0;
  };

  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    try {
      // Get all commands from all categories
      const response = await axios.get(`${API_BASE_URL}/commands`);
      const allCommands = response.data;

      // Search through all commands
      const searchMatches = allCommands.map(command => {
        const nameScore = fuzzySearch(query, command.name);
        const descriptionScore = fuzzySearch(query, command.description) * 0.7;
        const commandScore = fuzzySearch(query, command.command) * 0.5;
        const tagScore = command.tags ? 
          Math.max(...command.tags.map(tag => fuzzySearch(query, tag))) * 0.8 : 0;
        
        const totalScore = Math.max(nameScore, descriptionScore, commandScore, tagScore);
        
        return {
          ...command,
          searchScore: totalScore
        };
      }).filter(command => command.searchScore > 0)
        .sort((a, b) => b.searchScore - a.searchScore);

      setSearchResults(searchMatches);
    } catch (err) {
      console.error('Error performing search:', err);
      setError('Search failed: ' + (err.response?.data?.message || err.message));
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    console.log('Drag end:', { activeId: active.id, overId: over?.id });

    if (!over || active.id === over.id) {
      return;
    }

    // Find the phase that contains the dragged command
    const draggedCommand = commands.find(cmd => cmd._id === active.id);
    if (!draggedCommand) return;

    const phase = draggedCommand.phase;
    const phaseCommands = commands.filter(cmd => 
      cmd.category && cmd.category.type === activeCategory && cmd.phase === phase
    ).sort((a, b) => (a.order || 0) - (b.order || 0));

    console.log('Phase commands before reorder:', phaseCommands.map(cmd => ({ name: cmd.name, order: cmd.order })));

    const oldIndex = phaseCommands.findIndex(cmd => cmd._id === active.id);
    const newIndex = phaseCommands.findIndex(cmd => cmd._id === over.id);

    console.log('Indices:', { oldIndex, newIndex });

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedCommands = arrayMove(phaseCommands, oldIndex, newIndex);
    console.log('Reordered commands:', reorderedCommands.map(cmd => ({ name: cmd.name, order: cmd.order })));

    // Send reorder request to backend first
    try {
      // Get current maximum order value across all commands in this category and phase
      const allCommandsResponse = await axios.get(`${API_BASE_URL}/commands`);
      const allCommands = allCommandsResponse.data;
      
      // Find max order for this category-phase combination
      const maxOrder = Math.max(
        ...allCommands
          .filter(cmd => cmd.category && cmd.category.type === activeCategory && cmd.phase === phase)
          .map(cmd => cmd.order || 0),
        -1
      );

      // Assign new unique order values starting from maxOrder + 1000 to avoid conflicts
      const baseOrder = Math.max(maxOrder + 1000, 10000); // Ensure we start high enough
      const reorderData = reorderedCommands.map((cmd, index) => ({
        id: cmd._id,
        order: baseOrder + index
      }));

      console.log('Sending reorder data:', reorderData);

      await axios.put(`${API_BASE_URL}/commands/reorder`, {
        commands: reorderData
      });

      // Update local state after successful backend update
      const updatedCommands = commands.map(cmd => {
        if (cmd.category && cmd.category.type === activeCategory && cmd.phase === phase) {
          const reorderedIndex = reorderedCommands.findIndex(rc => rc._id === cmd._id);
          if (reorderedIndex !== -1) {
            return { ...cmd, order: baseOrder + reorderedIndex };
          }
        }
        return cmd;
      });

      console.log('Updated commands:', updatedCommands.filter(cmd => cmd.phase === phase).map(cmd => ({ name: cmd.name, order: cmd.order })));

      setCommands(updatedCommands);
      setSuccess('Commands reordered successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      console.error('Error reordering commands:', err);
      setError('Failed to save command order: ' + (err.response?.data?.message || err.message));
      // Don't revert changes - the user can try again
    }
  };

  const groupedCommands = commands.reduce((acc, command) => {
    const phase = command.phase;
    if (!acc[phase]) {
      acc[phase] = [];
    }
    acc[phase].push(command);
    return acc;
  }, {});

  // Sort commands within each phase by order
  Object.keys(groupedCommands).forEach(phase => {
    groupedCommands[phase].sort((a, b) => (a.order || 0) - (b.order || 0));
  });

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="sidebar">
        <h2>🛡️ PenTest Commands</h2>
        <nav>
          <ul>
            {getMainCategories().map(category => {
              const hasSubcategories = getSubcategories(category._id).length > 0;
              const isExpanded = !collapsedCategories.has(category._id);
              
              return (
                <li key={category._id}>
                  <div className="category-item">
                    <button
                      className={`accordion-button ${activeCategory === category.type ? 'active' : ''}`}
                      onClick={() => {
                        if (hasSubcategories) {
                          toggleCategoryCollapse(category._id);
                        } else {
                          setActiveCategory(category.type);
                        }
                      }}
                    >
                      <span className="category-name">{category.name}</span>
                      {hasSubcategories && (
                        <span className="accordion-icon">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      )}
                    </button>
                  </div>
                  {hasSubcategories && isExpanded && (
                    <ul className="subcategory-list">
                      {getSubcategories(category._id).map(subcat => (
                        <li key={subcat._id}>
                          <button
                            className={activeCategory === subcat.type ? 'active subcategory' : 'subcategory'}
                            onClick={() => setActiveCategory(subcat.type)}
                          >
                            {subcat.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="admin-section">
          <h3>⚙️ Admin Panel</h3>
          <div className="admin-buttons">
            <button 
              className="admin-btn"
              onClick={() => setShowAddCategory(true)}
            >
              Add Category
            </button>
            <button 
              className="admin-btn"
              onClick={() => setShowEditCategories(true)}
            >
              Edit Categories
            </button>
            <button 
              className="admin-btn"
              onClick={() => setShowAddCommand(true)}
            >
              Add Command
            </button>
          </div>
        </div>
      </div>

      <div className="main-content">
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
                <div className="domain-input">
          <h3>Target Information</h3>
          <div className="input-grid">
            <div className="input-group">
              <label>Domain:</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter domain name (e.g., example.com)"
              />
            </div>
            <div className="input-group">
              <label>IP/Range:</label>
              <input
                type="text"
                value={ipRange}
                onChange={(e) => setIpRange(e.target.value)}
                placeholder="Enter IP or range (e.g., 192.168.1.0/24)"
              />
            </div>
            <div className="input-group">
              <label>Port(s):</label>
              <input
                type="text"
                value={ports}
                onChange={(e) => setPorts(e.target.value)}
                placeholder="Enter ports (e.g., 80,443,8080)"
              />
            </div>
            <div className="input-group">
              <label>Filename:</label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="Enter filename (e.g., output.txt)"
              />
            </div>
          </div>
          <div className="generate-button-container">
            <button 
              className="generate-btn"
              onClick={generateCommands}
            >
              Generate Commands
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <h3>🔍 Search Commands</h3>
          <div className="search-input">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search commands by name, description, tags..."
              className="search-field"
            />
            {searchQuery && (
              <button 
                className="clear-search-btn"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearching(false);
                  setSearchResults([]);
                }}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          {isSearching && searchQuery && (
            <div className="search-info">
              Found {searchResults.length} matching commands
            </div>
          )}
        </div>

        {/* Commands Display */}
        {isSearching && searchQuery ? (
          // Search Results View
          <div className="search-results">
            <h2 className="section-title">Search Results</h2>
            {searchResults.length > 0 ? (
              <div className="commands-grid">
                {searchResults.map(command => (
                  <div key={command._id} className="command-card search-result">
                    <div className="command-header">
                      <h4>{command.name}</h4>
                      <div className="command-meta">
                        <span className="command-category">
                          {command.category?.name || 'Unknown'} → {command.phase}
                        </span>
                        <span className="search-score">
                          {Math.round(command.searchScore)}% match
                        </span>
                      </div>
                      <div className="command-actions">
                        <button 
                          onClick={() => handleEditCommand(command)}
                          className="edit-btn"
                          title="Edit command"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeleteCommand(command._id)}
                          className="delete-btn"
                          title="Delete command"
                        >
                          🗑️
                        </button>
                        <button 
                          onClick={() => copyToClipboard(command.generatedCommand || command.command)}
                          className="copy-btn"
                          title="Copy to clipboard"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                    <div className="command-description">{command.description}</div>
                    <div className="command-code">
                      {command.generatedCommand || command.command}
                    </div>
                    {command.tags && command.tags.length > 0 && (
                      <div className="command-tags">
                        {command.tags.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>No commands found matching "{searchQuery}"</p>
                <p>Try different keywords or check your spelling.</p>
              </div>
            )}
          </div>
        ) : (
          // Regular Category View with Drag and Drop
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {phases.map(phase => {
              const phaseCommands = groupedCommands[phase] || [];
              if (phaseCommands.length === 0) return null;

              return (
                <div key={phase} className="phase-section">
                  <h2 className="phase-title">{phase}</h2>
                  <SortableContext
                    items={phaseCommands.map(cmd => cmd._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="commands-grid">
                      {phaseCommands.map(command => (
                        <SortableCommandCard
                          key={command._id}
                          command={command}
                          onEdit={handleEditCommand}
                          onDelete={handleDeleteCommand}
                          onCopy={copyToClipboard}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </DndContext>
        )}

        {/* Add Category Modal */}
        {showAddCategory && (
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Add New Category</h3>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    placeholder="Enter category name"
                  />
                </div>
                <div className="form-group">
                  <label>Type:</label>
                  <input
                    type="text"
                    value={newCategory.type}
                    onChange={(e) => setNewCategory({...newCategory, type: e.target.value})}
                    placeholder="Enter category type (e.g., Web Application, Mobile, etc.)"
                  />
                </div>
                <div className="form-group">
                  <label>Parent Category (optional):</label>
                  <select
                    value={newCategory.parentCategory}
                    onChange={(e) => setNewCategory({...newCategory, parentCategory: e.target.value})}
                  >
                    <option value="">None (Main Category)</option>
                    {getMainCategories().map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                    placeholder="Enter category description"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <div className="form-buttons">
                  <button className="btn-cancel" onClick={() => setShowAddCategory(false)}>
                    Cancel
                  </button>
                  <button className="generate-btn" onClick={handleAddCategory}>
                    Add Category
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Categories Modal */}
        {showEditCategories && (
          <div className="modal large-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Edit Categories</h3>
                <p className="modal-subtitle">Drag to reorder, click Edit to modify, or Delete to remove categories</p>
              </div>
              <div className="modal-body">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleCategoryDragEnd}
                >
                  <SortableContext 
                    items={categories.map(cat => cat._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="categories-list">
                      {[...categories]
                        .sort((a, b) => a.order - b.order)
                        .map(category => (
                        <SortableCategory
                          key={category._id}
                          category={category}
                          isEditing={editingCategory === category._id}
                          onStartEdit={(id) => setEditingCategory(id)}
                          onCancelEdit={() => setEditingCategory(null)}
                          onSaveEdit={handleEditCategory}
                          onDelete={handleDeleteCategory}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
              <div className="modal-footer">
                <div className="form-buttons">
                  <button className="btn-cancel" onClick={() => {
                    setShowEditCategories(false);
                    setEditingCategory(null);
                  }}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Command Modal */}
        {showAddCommand && (
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Add New Command</h3>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={newCommand.name}
                    onChange={(e) => setNewCommand({...newCommand, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Command (use {domain} as placeholder):</label>
                  <input
                    type="text"
                    value={newCommand.command}
                    onChange={(e) => setNewCommand({...newCommand, command: e.target.value})}
                    placeholder="nmap -sC -sV {domain}"
                  />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    value={newCommand.description}
                    onChange={(e) => setNewCommand({...newCommand, description: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Category:</label>
                  <select
                    value={newCommand.category}
                    onChange={(e) => setNewCommand({...newCommand, category: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category._id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Phase:</label>
                  <select
                    value={newCommand.phase}
                    onChange={(e) => setNewCommand({...newCommand, phase: e.target.value})}
                  >
                    {phases.map(phase => (
                      <option key={phase} value={phase}>{phase}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tags (comma separated):</label>
                  <input
                    type="text"
                    value={newCommand.tags}
                    onChange={(e) => setNewCommand({...newCommand, tags: e.target.value})}
                    placeholder="nmap, scanning, ports"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <div className="form-buttons">
                  <button className="btn-cancel" onClick={() => setShowAddCommand(false)}>
                    Cancel
                  </button>
                  <button className="generate-btn" onClick={handleAddCommand}>
                    Add Command
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Command Modal */}
        {showEditCommand && (
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Edit Command</h3>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={newCommand.name}
                    onChange={(e) => setNewCommand({...newCommand, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Command (use {domain} as placeholder):</label>
                  <input
                    type="text"
                    value={newCommand.command}
                    onChange={(e) => setNewCommand({...newCommand, command: e.target.value})}
                    placeholder="nmap -sC -sV {domain}"
                  />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    value={newCommand.description}
                    onChange={(e) => setNewCommand({...newCommand, description: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Category:</label>
                  <select
                    value={newCommand.category}
                    onChange={(e) => setNewCommand({...newCommand, category: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category._id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Phase:</label>
                  <select
                    value={newCommand.phase}
                    onChange={(e) => setNewCommand({...newCommand, phase: e.target.value})}
                  >
                    {phases.map(phase => (
                      <option key={phase} value={phase}>{phase}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tags (comma separated):</label>
                  <input
                    type="text"
                    value={newCommand.tags}
                    onChange={(e) => setNewCommand({...newCommand, tags: e.target.value})}
                    placeholder="nmap, scanning, ports"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <div className="form-buttons">
                  <button className="btn-cancel" onClick={() => {
                    setShowEditCommand(false);
                    setEditingCommand(null);
                    setNewCommand({
                      name: '',
                      command: '',
                      description: '',
                      category: '',
                      phase: 'Reconnaissance',
                      tags: ''
                    });
                  }}>
                    Cancel
                  </button>
                  <button className="generate-btn" onClick={handleUpdateCommand}>
                    Update Command
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
