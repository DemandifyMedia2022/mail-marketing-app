import React, { useState } from 'react';
import type { SurveyField } from '../types/surveyBuilder.types';
import { 
  GripVertical, 
  Trash2, 
  Plus, 
  Copy,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Star
} from 'lucide-react';

interface SurveyBuilderProps {
  fields: SurveyField[];
  onChange: (fields: SurveyField[]) => void;
  onFieldUpdate?: (field: SurveyField) => void;
}

const SurveyBuilder: React.FC<SurveyBuilderProps> = ({ fields, onChange, onFieldUpdate }) => {
  console.log('=== SURVEY BUILDER RENDER ===');
  console.log('SurveyBuilder received fields:', fields);
  console.log('Fields length:', fields.length);
  console.log('Fields type:', typeof fields);
  console.log('Fields is array:', Array.isArray(fields));
  
  // Log each field
  fields.forEach((field, index) => {
    console.log(`Field ${index}:`, field);
  });
  
  const [draggedField, setDraggedField] = useState<SurveyField | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  const fieldTypes: { type: SurveyField['type']; label: string; icon: string }[] = [
    { type: 'text', label: 'Text Input', icon: '📝' },
    { type: 'email', label: 'Email', icon: '📧' },
    { type: 'phone', label: 'Phone', icon: '📞' },
    { type: 'number', label: 'Number', icon: '🔢' },
    { type: 'textarea', label: 'Textarea', icon: '📄' },
    { type: 'radio', label: 'Radio Button', icon: '⭕' },
    { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { type: 'dropdown', label: 'Dropdown', icon: '📋' },
    { type: 'rating', label: 'Rating (⭐)', icon: '⭐' },
    { type: 'emoji', label: 'Emoji Rating', icon: '😊' },
    { type: 'yesno', label: 'Yes/No Toggle', icon: '🔄' },
    { type: 'date', label: 'Date Picker', icon: '📅' },
    { type: 'file', label: 'File Upload', icon: '📎' },
    { type: 'divider', label: 'Section Header / Divider', icon: '➖' }
  ];

  const addField = (type: SurveyField['type']) => {
    console.log('Adding field of type:', type);
    console.log('Current fields before adding:', fields);
    
    let label: string;
    switch (type) {
      case 'text':
        label = 'New text field';
        break;
      case 'email':
        label = 'New email field';
        break;
      case 'phone':
        label = 'New phone field';
        break;
      case 'number':
        label = 'New number field';
        break;
      case 'textarea':
        label = 'New textarea field';
        break;
      case 'radio':
        label = 'New radio field';
        break;
      case 'checkbox':
        label = 'New checkbox field';
        break;
      case 'dropdown':
        label = 'New dropdown field';
        break;
      case 'rating':
        label = 'New rating field';
        break;
      case 'emoji':
        label = 'New emoji field';
        break;
      case 'yesno':
        label = 'New yesno field';
        break;
      case 'date':
        label = 'New date field';
        break;
      case 'file':
        label = 'New file field';
        break;
      case 'divider':
        label = 'Section Header';
        break;
      default:
        label = 'New field';
    }

    const newField: SurveyField = {
      id: Date.now().toString(),
      type,
      label,
      required: false,
      order: fields.length,
      hidden: false,
      ...(type === 'radio' || type === 'checkbox' || type === 'dropdown' ? {
        options: ['Option 1', 'Option 2']
      } : {}),
      ...(type === 'rating' || type === 'number' ? {
        validation: { min: 1, max: 5 }
      } : {})
    };

    console.log('New field created:', newField);
    console.log('Calling onChange with new fields:', [...fields, newField]);
    
    onChange([...fields, newField]);
    setExpandedFields(prev => new Set(prev).add(newField.id));
  };

  const updateField = (fieldId: string, updates: Partial<SurveyField>) => {
    const updatedFields = fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    );
    onChange(updatedFields);
    
    const updatedField = updatedFields.find(f => f.id === fieldId);
    if (updatedField && onFieldUpdate) {
      onFieldUpdate(updatedField);
    }
  };

  const deleteField = (fieldId: string) => {
    onChange(fields.filter(field => field.id !== fieldId));
  };

  const duplicateField = (field: SurveyField) => {
    const duplicatedField = {
      ...field,
      id: Date.now().toString(),
      label: `${field.label} (Copy)`,
      order: fields.length
    };
    onChange([...fields, duplicatedField]);
  };

  const moveField = (dragIndex: number, dropIndex: number) => {
    const newFields = [...fields];
    const [draggedItem] = newFields.splice(dragIndex, 1);
    newFields.splice(dropIndex, 0, draggedItem);
    
    // Update order for all fields
    const reorderedFields = newFields.map((field, index) => ({
      ...field,
      order: index
    }));
    
    onChange(reorderedFields);
  };

  const handleDragStart = (e: React.DragEvent, field: SurveyField, index: number) => {
    setDraggedField({ ...field, order: index });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedField && draggedField.order !== undefined) {
      moveField(draggedField.order, dropIndex);
    }
    setDraggedField(null);
    setDragOverIndex(null);
  };

  const addOption = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && field.options) {
      updateField(fieldId, {
        options: [...field.options, `Option ${field.options.length + 1}`]
      });
    }
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && field.options) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateField(fieldId, { options: newOptions });
    }
  };

  const deleteOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && field.options && field.options.length > 1) {
      updateField(fieldId, {
        options: field.options.filter((_, index) => index !== optionIndex)
      });
    }
  };

  const toggleFieldExpanded = (fieldId: string) => {
    setExpandedFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fieldId)) {
        newSet.delete(fieldId);
      } else {
        newSet.add(fieldId);
      }
      return newSet;
    });
  };

  const renderFieldPreview = (field: SurveyField) => {
    const baseClasses = "w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent";
    
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            placeholder={field.placeholder || field.label}
            className={baseClasses}
            disabled
          />
        );
      
      case 'email':
        return (
          <input
            type="email"
            placeholder={field.placeholder || 'Enter email address'}
            className={baseClasses}
            disabled
          />
        );
      
      case 'phone':
        return (
          <input
            type="tel"
            placeholder={field.placeholder || 'Enter phone number'}
            className={baseClasses}
            disabled
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            placeholder={field.placeholder || 'Enter number'}
            className={baseClasses}
            disabled
          />
        );
      
      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder || field.label}
            rows={4}
            className={`${baseClasses} resize-none`}
            disabled
          />
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input type="radio" name={`preview-${field.id}`} disabled />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input type="checkbox" disabled />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'dropdown':
        return (
          <select className={baseClasses} disabled>
            <option>Select an option</option>
            {field.options?.map((option, index) => (
              <option key={index}>{option}</option>
            ))}
          </select>
        );
      
      case 'rating':
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} className="w-6 h-6 text-amber-400 fill-current" />
            ))}
          </div>
        );
      
      case 'emoji':
        return (
          <div className="flex space-x-2">
            {['😞', '😐', '🙂', '😊', '😍'].map((emoji, index) => (
              <span key={index} className="text-2xl cursor-pointer hover:scale-110 transition-transform">
                {emoji}
              </span>
            ))}
          </div>
        );
      
      case 'yesno':
        return (
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input type="radio" name={`yesno-${field.id}`} disabled />
              <span>Yes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" name={`yesno-${field.id}`} disabled />
              <span>No</span>
            </label>
          </div>
        );
      
      case 'date':
        return (
          <input
            type="date"
            className={baseClasses}
            disabled
          />
        );
      
      case 'file':
        return (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
            <p className="text-slate-600">📎 Click to upload or drag and drop</p>
            <p className="text-sm text-slate-500">PDF, DOC, DOCX up to 10MB</p>
          </div>
        );
      
      case 'divider':
        return (
          <div className="border-t-2 border-slate-300 my-4">
            <h3 className="text-lg font-semibold text-slate-900 mt-2">{field.label}</h3>
          </div>
        );
      
      default:
        return <div className="text-slate-500">Unknown field type</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Field Types Sidebar */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Add Field</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {fieldTypes.map((fieldType) => (
              <button
                key={fieldType.type}
                type="button"
                onClick={() => addField(fieldType.type)}
                className="flex flex-col items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-blue-300 transition-colors"
              >
                <span className="text-2xl mb-1">{fieldType.icon}</span>
                <span className="text-xs text-slate-700 text-center">{fieldType.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Survey Fields */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Survey Fields</h2>
            <div className="text-sm text-slate-600">
              {fields.length} field{fields.length !== 1 ? 's' : ''}
            </div>
          </div>

          {(() => {
            console.log('=== CONDITIONAL RENDERING CHECK ===');
            console.log('fields.length:', fields.length);
            console.log('fields.length === 0:', fields.length === 0);
            console.log('About to render:', fields.length === 0 ? 'NO FIELDS MESSAGE' : 'FIELDS LIST');
            return fields.length === 0;
          })() ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No fields added yet</h3>
              <p className="text-slate-600">Start building your survey by adding fields from above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, field, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`border rounded-xl overflow-hidden transition-all ${
                    dragOverIndex === index ? 'border-blue-400 bg-blue-50' : 'border-slate-200'
                  } ${field.hidden ? 'opacity-50' : ''}`}
                >
                  {/* Field Header */}
                  <div 
                    className="flex items-center justify-between p-4 bg-slate-50 cursor-pointer hover:bg-slate-100"
                    onClick={() => toggleFieldExpanded(field.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <GripVertical className="w-5 h-5 text-slate-400 cursor-move" />
                      <span className="font-medium text-slate-900">
                        {field.type === 'divider' ? '📄' : '📝'} {field.label}
                      </span>
                      {field.required && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          Required
                        </span>
                      )}
                      {field.hidden && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                          Hidden
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateField(field.id, { hidden: !field.hidden });
                        }}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title={field.hidden ? 'Show field' : 'Hide field'}
                      >
                        {field.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateField(field);
                        }}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Duplicate field"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteField(field.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete field"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {expandedFields.has(field.id) ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Field Content */}
                  {expandedFields.has(field.id) && (
                    <div className="p-4 border-t border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Field Label
                          </label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        {field.type !== 'divider' && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Placeholder
                            </label>
                            <input
                              type="text"
                              value={field.placeholder || ''}
                              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        )}
                      </div>

                      {/* Options for choice fields */}
                      {(field.type === 'radio' || field.type === 'checkbox' || field.type === 'dropdown') && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700">
                              Options
                            </label>
                            <button
                              type="button"
                              onClick={() => addOption(field.id)}
                              className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-sm transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Option</span>
                            </button>
                          </div>
                          <div className="space-y-2">
                            {field.options?.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder={`Option ${optionIndex + 1}`}
                                />
                                {field.options && field.options.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => deleteOption(field.id, optionIndex)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Validation for number fields */}
                      {(field.type === 'number' || field.type === 'rating') && (
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Min Value
                            </label>
                            <input
                              type="number"
                              value={field.validation?.min || ''}
                              onChange={(e) => updateField(field.id, {
                                validation: { ...field.validation, min: parseInt(e.target.value) }
                              })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Max Value
                            </label>
                            <input
                              type="number"
                              value={field.validation?.max || ''}
                              onChange={(e) => updateField(field.id, {
                                validation: { ...field.validation, max: parseInt(e.target.value) }
                              })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      )}

                      {/* Required checkbox */}
                      {field.type !== 'divider' && (
                        <div className="flex items-center space-x-2 mb-4">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label className="text-sm font-medium text-slate-700">
                            Required field
                          </label>
                        </div>
                      )}

                      {/* Preview */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Preview
                        </label>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          {field.type !== 'divider' && (
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                          )}
                          {renderFieldPreview(field)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyBuilder;
