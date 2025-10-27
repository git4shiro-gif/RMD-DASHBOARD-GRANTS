import React, { useState, useMemo, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import { BsSearch, BsX, BsFunnel, BsFileEarmarkSpreadsheet, BsTrash, BsCaretDownFill } from 'react-icons/bs';

function CsvUploader() {
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [columnFilters, setColumnFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [fileName, setFileName] = useState('');
  const [openFilterDropdown, setOpenFilterDropdown] = useState(null);
  const [frozenColumns, setFrozenColumns] = useState(new Set());
  const dropdownRef = useRef(null);
  const headerRefs = useRef({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Check if click is on a filter button
        const isFilterButton = event.target.closest('button');
        if (!isFilterButton) {
          setOpenFilterDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Position dropdown relative to header button
  useEffect(() => {
    if (openFilterDropdown !== null && dropdownRef.current && headerRefs.current[openFilterDropdown]) {
      const button = headerRefs.current[openFilterDropdown];
      const rect = button.getBoundingClientRect();
      const dropdown = dropdownRef.current;
      
      dropdown.style.top = `${rect.bottom + window.scrollY + 4}px`;
      
      // Smart positioning: align to right edge, but ensure it's visible on screen
      const dropdownWidth = 220;
      let leftPosition = rect.right - dropdownWidth;
      
      // If it goes off the left edge of screen, align to left edge of button instead
      if (leftPosition < 10) {
        leftPosition = rect.left;
      }
      
      // If it goes off right edge, align to right edge of screen
      if (leftPosition + dropdownWidth > window.innerWidth - 10) {
        leftPosition = window.innerWidth - dropdownWidth - 10;
      }
      
      dropdown.style.left = `${leftPosition}px`;
    }
  }, [openFilterDropdown]);

  // Toggle frozen column
  const toggleFrozenColumn = (columnIndex) => {
    setFrozenColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnIndex)) {
        newSet.delete(columnIndex);
      } else {
        newSet.add(columnIndex);
      }
      return newSet;
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setIsLoading(true);
    setError(null);

    if (file) {
      if (file.type !== 'text/csv') {
        setError('Please upload a valid CSV file');
        setIsLoading(false);
        return;
      }

      setFileName(file.name);

      Papa.parse(file, {
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setHeaders(results.data[0]);
            setCsvData(results.data.slice(1));
            setColumnFilters({});
            setSearchTerm('');
          }
          setIsLoading(false);
        },
        header: false,
        skipEmptyLines: true,
        error: (error) => {
          setError('Error parsing CSV file: ' + error.message);
          setIsLoading(false);
        }
      });
    }
  };

  const handleRemoveFile = () => {
    setCsvData([]);
    setHeaders([]);
    setFileName('');
    setColumnFilters({});
    setSearchTerm('');
    setError(null);
    setOpenFilterDropdown(null);
    const fileInput = document.getElementById('csvInput');
    if (fileInput) fileInput.value = '';
  };

  // Get unique values for each column
  const getUniqueValues = (columnIndex) => {
    const values = csvData.map(row => row[columnIndex]).filter(val => val && val.trim() !== '');
    return [...new Set(values)].sort();
  };

  // Handle filter change for a specific column
  const handleFilterChange = (columnIndex, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnIndex]: value
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setColumnFilters({});
    setSearchTerm('');
  };

  // Toggle filter dropdown
  const toggleFilterDropdown = (columnIndex, event) => {
    event.stopPropagation();
    setOpenFilterDropdown(openFilterDropdown === columnIndex ? null : columnIndex);
  };

  // Filter data based on column filters and search term
  const filteredData = useMemo(() => {
    return csvData.filter(row => {
      // Apply column filters
      const matchesColumnFilters = Object.entries(columnFilters).every(([columnIndex, filterValue]) => {
        if (!filterValue) return true;
        return row[columnIndex] === filterValue;
      });

      // Apply global search
      const matchesSearch = searchTerm === '' || 
        row.some(cell => 
          cell && cell.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

      return matchesColumnFilters && matchesSearch;
    });
  }, [csvData, columnFilters, searchTerm]);

  // Count active filters
  const activeFilterCount = Object.values(columnFilters).filter(v => v).length + (searchTerm ? 1 : 0);

  return (
    <div style={{
      padding: 'clamp(20px, 3vw, 40px)',
      maxWidth: '100%',
      margin: '0 auto',
      boxSizing: 'border-box'
    }}>
      {/* Header Section */}
      <div style={{
        marginBottom: 'clamp(30px, 4vh, 40px)',
        borderBottom: '2px solid rgba(0, 51, 160, 0.1)',
        paddingBottom: 'clamp(15px, 2vh, 20px)'
      }}>
        <h1 style={{
          color: '#1e293b',
          fontSize: 'clamp(24px, 3vw, 32px)',
          fontWeight: '700',
          margin: '0 0 8px 0'
        }}>
          CSV File Upload
        </h1>
        <p style={{
          color: '#64748b',
          fontSize: 'clamp(14px, 1.6vw, 16px)',
          margin: '0'
        }}>
          Upload and view CSV data with Excel-style filtering
        </p>
      </div>

      {/* Upload Section */}
      <div style={{
        background: 'white',
        padding: 'clamp(20px, 3vw, 30px)',
        borderRadius: 'clamp(12px, 2vw, 16px)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        marginBottom: 'clamp(30px, 4vh, 40px)'
      }}>
        {!fileName ? (
          <div style={{
            border: '2px dashed #cbd5e1',
            borderRadius: 'clamp(8px, 1.5vw, 12px)',
            padding: 'clamp(30px, 4vh, 40px)',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="csvInput"
            />
            <label
              htmlFor="csvInput"
              style={{
                background: 'linear-gradient(135deg, #0033a0 0%, #0052cc 100%)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-block',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px rgba(0, 51, 160, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 8px rgba(0, 51, 160, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 51, 160, 0.2)';
              }}
            >
              Choose CSV File
            </label>
            <p style={{ 
              marginTop: '12px',
              color: '#64748b',
              fontSize: '0.875rem'
            }}>
              or drag and drop your file here
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            background: '#f0f9ff',
            border: '2px solid #0ea5e9',
            borderRadius: '8px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1', minWidth: '200px' }}>
              <BsFileEarmarkSpreadsheet style={{ fontSize: '32px', color: '#0033a0' }} />
              <div>
                <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>
                  {fileName}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                  {csvData.length} rows × {headers.length} columns
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="csvInputReplace"
              />
              <label
                htmlFor="csvInputReplace"
                style={{
                  background: '#0033a0',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#0052cc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#0033a0';
                }}
              >
                Replace File
              </label>
              <button
                onClick={handleRemoveFile}
                style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fecaca';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fee2e2';
                }}
              >
                <BsTrash /> Remove
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Loading data...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#dc2626',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* Global Search and Clear Filters */}
      {csvData.length > 0 && (
        <div style={{
          background: 'white',
          padding: '16px 20px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Global Search */}
          <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
            <BsSearch style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b'
            }} />
            <input
              type="text"
              placeholder="Search all columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 40px 10px 40px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            {searchTerm && (
              <BsX
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#64748b',
                  fontSize: '20px'
                }}
              />
            )}
          </div>

          {/* Frozen columns info */}
          {frozenColumns.size > 0 && (
            <div style={{
              padding: '8px 16px',
              background: '#f0f9ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#0033a0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              📌 {frozenColumns.size} column{frozenColumns.size > 1 ? 's' : ''} pinned
            </div>
          )}

          {/* Clear All Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              style={{
                padding: '10px 20px',
                background: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Clear All Filters ({activeFilterCount})
            </button>
          )}
        </div>
      )}

      {/* Table Section */}
      {csvData.length > 0 && (
        <div style={{
          width: '100%',
          overflowX: 'auto',
          overflowY: 'auto',
          maxHeight: '70vh',
          background: 'white',
          borderRadius: 'clamp(12px, 2vw, 16px)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          WebkitOverflowScrolling: 'touch',
          border: '2px solid #0033a0',
          position: 'relative'
        }}>
          <table style={{
            width: '100%',
            minWidth: '600px',
            borderCollapse: 'separate',
            borderSpacing: 0,
            fontSize: 'clamp(13px, 1.4vw, 15px)'
          }}>
            <thead>
              <tr style={{
                background: 'linear-gradient(135deg, #0033a0 0%, #0052cc 100%)',
                color: 'white'
              }}>
                {headers.map((header, index) => {
                  // Calculate left position for frozen columns
                  let leftPosition = 0;
                  if (frozenColumns.has(index)) {
                    const sortedFrozen = Array.from(frozenColumns).sort((a, b) => a - b);
                    const columnsBeforeThis = sortedFrozen.filter(i => i < index);
                    leftPosition = columnsBeforeThis.reduce((sum, colIndex) => {
                      // Approximate column width - you can adjust this
                      return sum + 150; // Default column width
                    }, 0);
                  }
                  
                  return (
                  <th key={index} style={{
                    padding: 'clamp(10px, 1.5vw, 12px)',
                    textAlign: 'left',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    position: 'sticky',
                    top: 0,
                    left: frozenColumns.has(index) ? `${leftPosition}px` : 'auto',
                    background: frozenColumns.has(index) 
                      ? 'linear-gradient(135deg, #0052cc 0%, #0033a0 100%)' 
                      : 'linear-gradient(135deg, #0033a0 0%, #0052cc 100%)',
                    zIndex: frozenColumns.has(index) ? (openFilterDropdown === index ? 1002 : 20) : (openFilterDropdown === index ? 1001 : 15),
                    borderRight: '2px solid rgba(96, 165, 250, 0.4)',
                    borderBottom: '2px solid rgba(96, 165, 250, 0.4)',
                    boxShadow: frozenColumns.has(index) ? '2px 0 8px rgba(0, 51, 160, 0.3)' : 'none',
                    minWidth: '150px'
                  }}
                  data-col-index={index}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      position: 'relative'
                    }}>
                      <span style={{ flex: 1 }}>{header}</span>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        {/* Pin/Unpin button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFrozenColumn(index);
                          }}
                          title={frozenColumns.has(index) ? "Unpin column" : "Pin column"}
                          style={{
                            background: frozenColumns.has(index) ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 255, 255, 0.15)',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            color: 'white',
                            fontSize: '12px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = frozenColumns.has(index) ? 'rgba(255, 215, 0, 0.5)' : 'rgba(255, 255, 255, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = frozenColumns.has(index) ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 255, 255, 0.15)';
                          }}
                        >
                          {frozenColumns.has(index) ? '📌' : '📍'}
                        </button>
                        
                        {/* Filter button */}
                        <button
                          ref={(el) => (headerRefs.current[index] = el)}
                          onClick={(e) => toggleFilterDropdown(index, e)}
                          style={{
                            background: columnFilters[index] ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: 'white',
                            fontSize: '12px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = columnFilters[index] ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)';
                          }}
                        >
                          <BsCaretDownFill style={{ fontSize: '10px' }} />
                          {columnFilters[index] && <span>✓</span>}
                        </button>
                      </div>

                      {/* Filter Dropdown */}
                      {openFilterDropdown === index && (
                        <div
                          ref={dropdownRef}
                          style={{
                            position: 'fixed',
                            marginTop: '8px',
                            background: 'white',
                            border: '2px solid #0033a0',
                            borderRadius: '8px',
                            boxShadow: '0 8px 24px rgba(0, 51, 160, 0.3)',
                            minWidth: '220px',
                            maxWidth: '300px',
                            maxHeight: '350px',
                            overflowY: 'auto',
                            zIndex: 9999
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div style={{
                            padding: '12px',
                            borderBottom: '1px solid #e2e8f0',
                            position: 'sticky',
                            top: 0,
                            background: 'white',
                            fontWeight: '600',
                            color: '#0f172a',
                            fontSize: '14px'
                          }}>
                            Filter by {header}
                          </div>
                          <div
                            onClick={() => {
                              handleFilterChange(index, '');
                              setOpenFilterDropdown(null);
                            }}
                            style={{
                              padding: '10px 12px',
                              cursor: 'pointer',
                              color: !columnFilters[index] ? '#0033a0' : '#1e293b',
                              fontWeight: !columnFilters[index] ? '600' : '400',
                              background: !columnFilters[index] ? '#f0f9ff' : 'white',
                              borderLeft: !columnFilters[index] ? '3px solid #0033a0' : '3px solid transparent',
                              fontSize: '13px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (columnFilters[index]) {
                                e.currentTarget.style.background = '#f8fafc';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (columnFilters[index]) {
                                e.currentTarget.style.background = 'white';
                              }
                            }}
                          >
                            (Show All)
                          </div>
                          {getUniqueValues(index).slice(0, 100).map((value, i) => (
                            <div
                              key={i}
                              onClick={() => {
                                handleFilterChange(index, value);
                                setOpenFilterDropdown(null);
                              }}
                              style={{
                                padding: '10px 12px',
                                cursor: 'pointer',
                                color: columnFilters[index] === value ? '#0033a0' : '#1e293b',
                                fontWeight: columnFilters[index] === value ? '600' : '400',
                                background: columnFilters[index] === value ? '#f0f9ff' : 'white',
                                borderLeft: columnFilters[index] === value ? '3px solid #0033a0' : '3px solid transparent',
                                fontSize: '13px',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                if (columnFilters[index] !== value) {
                                  e.currentTarget.style.background = '#f8fafc';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (columnFilters[index] !== value) {
                                  e.currentTarget.style.background = 'white';
                                }
                              }}
                            >
                              {value}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row, rowIndex) => (
                  <tr 
                    key={rowIndex}
                    style={{
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f9ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {row.map((cell, cellIndex) => {
                      // Calculate left position for frozen columns
                      let leftPosition = 0;
                      if (frozenColumns.has(cellIndex)) {
                        const sortedFrozen = Array.from(frozenColumns).sort((a, b) => a - b);
                        const columnsBeforeThis = sortedFrozen.filter(i => i < cellIndex);
                        leftPosition = columnsBeforeThis.reduce((sum, colIndex) => {
                          return sum + 150;
                        }, 0);
                      }
                      
                      return (
                      <td 
                        key={cellIndex}
                        style={{
                          padding: 'clamp(12px, 1.5vw, 16px)',
                          color: '#1e293b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '300px',
                          minWidth: '150px',
                          borderRight: '1px solid #bfdbfe',
                          borderBottom: '1px solid #bfdbfe',
                          position: frozenColumns.has(cellIndex) ? 'sticky' : 'static',
                          left: frozenColumns.has(cellIndex) ? `${leftPosition}px` : 'auto',
                          background: frozenColumns.has(cellIndex) ? '#f8fafc' : 'inherit',
                          zIndex: frozenColumns.has(cellIndex) ? 10 : 'auto',
                          boxShadow: frozenColumns.has(cellIndex) ? '2px 0 8px rgba(0, 51, 160, 0.1)' : 'none'
                        }}
                        title={cell}
                        data-col-index={cellIndex}
                      >
                        {cell}
                      </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td 
                    colSpan={headers.length}
                    style={{
                      padding: '40px',
                      textAlign: 'center',
                      color: '#64748b',
                      fontSize: '16px'
                    }}
                  >
                    No results found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Data Summary */}
      {csvData.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: '#f0f9ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#475569',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <strong>Showing:</strong> {filteredData.length} of {csvData.length} rows × {headers.length} columns
            {activeFilterCount > 0 && (
              <span style={{ marginLeft: '8px', color: '#0033a0', fontWeight: '600' }}>
                ({activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active)
              </span>
            )}
          </div>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            💡 Click 📍 to pin columns | Click filter icon to filter
          </div>
        </div>
      )}

      <style>{`
        /* Custom scrollbar for table and dropdown */
        div::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        
        div::-webkit-scrollbar-track {
          background: #dbeafe;
          border-radius: 4px;
        }
        
        div::-webkit-scrollbar-thumb {
          background: #60a5fa;
          border-radius: 4px;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: #3b82f6;
        }

        select:focus, input:focus {
          outline: 2px solid #0033a0;
          outline-offset: 2px;
        }

        button:hover {
          transform: translateY(-1px);
        }

        button:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}

export default CsvUploader;