import React, { useState, useRef, useEffect } from 'react';
import { getSuggestions, getCategoryByName } from '../utils/productCategories';

/**
 * Компонент поля ввода с автодополнением
 */
const AutocompleteInput = ({ value, onChange, placeholder }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categoryIcon, setCategoryIcon] = useState(null);
  const inputRef = useRef(null);
  const suggestionRef = useRef(null);

  // Обработка клика вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Обновление подсказок при изменении значения поля
  useEffect(() => {
    if (value) {
      const newSuggestions = getSuggestions(value);
      setSuggestions(newSuggestions);
      
      // Определение категории товара для отображения иконки
      const category = getCategoryByName(value);
      setCategoryIcon(category ? category.icon : null);
    } else {
      setSuggestions([]);
      setCategoryIcon(null);
    }
  }, [value]);

  // Обработка изменения значения поля
  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.length >= 2) {
      setSuggestions(getSuggestions(newValue));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Обработка выбора подсказки
  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion);
    setShowSuggestions(false);
    
    // Определение категории товара для отображения иконки
    const category = getCategoryByName(suggestion);
    setCategoryIcon(category ? category.icon : null);
  };

  // Обработка фокуса на поле ввода
  const handleFocus = () => {
    if (value && value.length >= 2) {
      setSuggestions(getSuggestions(value));
      setShowSuggestions(true);
    }
  };

  return (
    <div className="autocomplete-wrapper">
      <div className="input-with-icon">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          className="form-control"
          placeholder={placeholder}
        />
        {categoryIcon && (
          <i className={`${categoryIcon} product-category-icon`}></i>
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <ul ref={suggestionRef} className="suggestions-list">
          {suggestions.map((suggestion, index) => {
            const category = getCategoryByName(suggestion);
            return (
              <li 
                key={index} 
                onClick={() => handleSuggestionClick(suggestion)}
                className="suggestion-item"
              >
                {category && <i className={`${category.icon} suggestion-icon`}></i>}
                {suggestion}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;