import { useState, useEffect, useRef } from "react";

const FILTERS = ["All", "Active", "Completed"];
const PRIORITIES = ["low", "medium", "high"];
const CATEGORIES = ["Personal", "Work", "Health", "Learning", "Other"];

const priorityConfig = {
  low: { color: "#4ade80", label: "Low", dot: "🟢" },
  medium: { color: "#facc15", label: "Med", dot: "🟡" },
  high: { color: "#f87171", label: "High", dot: "🔴" },
};

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function formatDate(ts) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(ts));
}

export default function TodoApp() {
  const [todos, setTodos] = useState([
    { id: "a1b2c3d", text: "Design the new landing page", completed: false, priority: "high", category: "Work", createdAt: Date.now() - 86400000, dueDate: "", subtasks: [{ id: "s1", text: "Wireframes", done: true }, { id: "s2", text: "Color palette", done: false }], pinned: true },
    { id: "e4f5g6h", text: "Morning run – 5km", completed: true, priority: "medium", category: "Health", createdAt: Date.now() - 3600000, dueDate: "", subtasks: [], pinned: false },
    { id: "i7j8k9l", text: "Read Atomic Habits chapter 4", completed: false, priority: "low", category: "Learning", createdAt: Date.now() - 7200000, dueDate: "", subtasks: [], pinned: false },
  ]);

  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("Personal");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [sortBy, setSortBy] = useState("created");
  const [showStats, setShowStats] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  const addTodo = () => {
    if (!input.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setTodos(prev => [{
      id: generateId(),
      text: input.trim(),
      completed: false,
      priority,
      category,
      createdAt: Date.now(),
      dueDate,
      subtasks: [],
      pinned: false,
    }, ...prev]);
    setInput("");
    setDueDate("");
  };

  const toggleTodo = (id) => setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const deleteTodo = (id) => setTodos(prev => prev.filter(t => t.id !== id));
  const pinTodo = (id) => setTodos(prev => prev.map(t => t.id === id ? { ...t, pinned: !t.pinned } : t));
  const clearCompleted = () => setTodos(prev => prev.filter(t => !t.completed));

  const saveEdit = (id) => {
    if (!editText.trim()) return;
    setTodos(prev => prev.map(t => t.id === id ? { ...t, text: editText.trim() } : t));
    setEditId(null);
  };

  const addSubtask = (id) => {
    if (!subtaskInput.trim()) return;
    setTodos(prev => prev.map(t => t.id === id ? { ...t, subtasks: [...t.subtasks, { id: generateId(), text: subtaskInput.trim(), done: false }] } : t));
    setSubtaskInput("");
  };

  const toggleSubtask = (todoId, subId) => {
    setTodos(prev => prev.map(t => t.id === todoId ? { ...t, subtasks: t.subtasks.map(s => s.id === subId ? { ...s, done: !s.done } : s) } : t));
  };

  const deleteSubtask = (todoId, subId) => {
    setTodos(prev => prev.map(t => t.id === todoId ? { ...t, subtasks: t.subtasks.filter(s => s.id !== subId) } : t));
  };

  const filtered = todos
    .filter(t => {
      if (filter === "Active" && t.completed) return false;
      if (filter === "Completed" && !t.completed) return false;
      if (categoryFilter !== "All" && t.category !== categoryFilter) return false;
      if (search && !t.text.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return b.pinned - a.pinned;
      if (sortBy === "priority") {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      }
      if (sortBy === "alpha") return a.text.localeCompare(b.text);
      return b.createdAt - a.createdAt;
    });

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length,
    high: todos.filter(t => t.priority === "high" && !t.completed).length,
  };

  const completionPct = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  const bg = darkMode ? "#0a0a0f" : "#f5f3ee";
  const surface = darkMode ? "#13131a" : "#ffffff";
  const surfaceHover = darkMode ? "#1c1c28" : "#f0ede8";
  const border = darkMode ? "#2a2a3d" : "#e0dbd3";
  const text = darkMode ? "#e8e6f0" : "#1a1814";
  const textMuted = darkMode ? "#6b6880" : "#8a8278";
  const accent = "#c084fc";
  const accentDim = darkMode ? "#2d1b3d" : "#f3e8ff";

  const styles = {
    app: {
      minHeight: "100vh",
      background: bg,
      color: text,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      transition: "all 0.3s ease",
      padding: "0",
    },
    container: {
      maxWidth: "720px",
      margin: "0 auto",
      padding: "40px 20px 80px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "40px",
    },
    logo: {
      fontSize: "32px",
      fontWeight: "800",
      letterSpacing: "-1.5px",
      background: `linear-gradient(135deg, ${accent}, #818cf8)`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      lineHeight: 1,
    },
    subtitle: {
      fontSize: "13px",
      color: textMuted,
      marginTop: "4px",
      letterSpacing: "0.5px",
    },
    headerRight: {
      display: "flex",
      gap: "8px",
      alignItems: "center",
    },
    iconBtn: {
      background: surface,
      border: `1px solid ${border}`,
      color: textMuted,
      borderRadius: "10px",
      padding: "8px 12px",
      cursor: "pointer",
      fontSize: "13px",
      transition: "all 0.2s",
    },
    statsBar: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "12px",
      marginBottom: "28px",
    },
    statCard: {
      background: surface,
      border: `1px solid ${border}`,
      borderRadius: "14px",
      padding: "16px",
      textAlign: "center",
    },
    statNum: { fontSize: "24px", fontWeight: "700", letterSpacing: "-1px" },
    statLabel: { fontSize: "11px", color: textMuted, marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.8px" },
    inputCard: {
      background: surface,
      border: `1px solid ${border}`,
      borderRadius: "18px",
      padding: "20px",
      marginBottom: "20px",
      boxShadow: darkMode ? "0 4px 40px rgba(192,132,252,0.06)" : "0 4px 20px rgba(0,0,0,0.05)",
    },
    mainInput: {
      width: "100%",
      background: "transparent",
      border: "none",
      outline: "none",
      fontSize: "16px",
      color: text,
      fontFamily: "inherit",
      fontWeight: "500",
      marginBottom: "14px",
      caretColor: accent,
    },
    inputRow: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
      alignItems: "center",
    },
    select: {
      background: surfaceHover,
      border: `1px solid ${border}`,
      color: text,
      borderRadius: "8px",
      padding: "6px 10px",
      fontSize: "12px",
      cursor: "pointer",
      fontFamily: "inherit",
      outline: "none",
    },
    dateInput: {
      background: surfaceHover,
      border: `1px solid ${border}`,
      color: text,
      borderRadius: "8px",
      padding: "6px 10px",
      fontSize: "12px",
      fontFamily: "inherit",
      outline: "none",
      colorScheme: darkMode ? "dark" : "light",
    },
    addBtn: {
      marginLeft: "auto",
      background: `linear-gradient(135deg, ${accent}, #818cf8)`,
      border: "none",
      color: "#fff",
      borderRadius: "10px",
      padding: "8px 20px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      fontFamily: "inherit",
      boxShadow: `0 4px 15px rgba(192,132,252,0.4)`,
      transition: "transform 0.15s, box-shadow 0.15s",
    },
    filterRow: {
      display: "flex",
      gap: "8px",
      marginBottom: "16px",
      flexWrap: "wrap",
      alignItems: "center",
    },
    filterBtn: (active) => ({
      background: active ? accentDim : "transparent",
      border: `1px solid ${active ? accent : border}`,
      color: active ? accent : textMuted,
      borderRadius: "20px",
      padding: "5px 14px",
      fontSize: "12px",
      fontWeight: active ? "600" : "400",
      cursor: "pointer",
      transition: "all 0.2s",
    }),
    searchInput: {
      flex: 1,
      background: surface,
      border: `1px solid ${border}`,
      borderRadius: "20px",
      padding: "6px 14px",
      fontSize: "13px",
      color: text,
      outline: "none",
      fontFamily: "inherit",
    },
    sortSelect: {
      background: "transparent",
      border: `1px solid ${border}`,
      color: textMuted,
      borderRadius: "8px",
      padding: "5px 8px",
      fontSize: "11px",
      cursor: "pointer",
      fontFamily: "inherit",
      outline: "none",
    },
    progressBar: {
      height: "3px",
      background: border,
      borderRadius: "99px",
      marginBottom: "24px",
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      width: `${completionPct}%`,
      background: `linear-gradient(90deg, ${accent}, #818cf8)`,
      borderRadius: "99px",
      transition: "width 0.5s ease",
    },
    todoList: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    todoCard: (completed, pinned) => ({
      background: surface,
      border: `1px solid ${pinned ? accent + "44" : border}`,
      borderRadius: "14px",
      padding: "14px 16px",
      transition: "all 0.2s",
      opacity: completed ? 0.65 : 1,
      boxShadow: pinned ? `0 0 0 1px ${accent}22` : "none",
    }),
    todoMain: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    checkbox: (completed) => ({
      width: "20px",
      height: "20px",
      borderRadius: "6px",
      border: `2px solid ${completed ? accent : border}`,
      background: completed ? accent : "transparent",
      cursor: "pointer",
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s",
    }),
    todoText: (completed) => ({
      flex: 1,
      fontSize: "15px",
      fontWeight: "500",
      textDecoration: completed ? "line-through" : "none",
      color: completed ? textMuted : text,
      cursor: "pointer",
      letterSpacing: "-0.2px",
    }),
    badge: (color) => ({
      fontSize: "10px",
      fontWeight: "700",
      padding: "2px 8px",
      borderRadius: "99px",
      background: color + "22",
      color: color,
      border: `1px solid ${color}44`,
      letterSpacing: "0.4px",
      textTransform: "uppercase",
    }),
    actionBtn: {
      background: "transparent",
      border: "none",
      color: textMuted,
      cursor: "pointer",
      fontSize: "15px",
      padding: "2px 4px",
      borderRadius: "6px",
      transition: "all 0.15s",
    },
    metaRow: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginTop: "8px",
      paddingLeft: "32px",
      flexWrap: "wrap",
    },
    metaText: {
      fontSize: "11px",
      color: textMuted,
    },
    expandedSection: {
      marginTop: "12px",
      paddingLeft: "32px",
      borderTop: `1px solid ${border}`,
      paddingTop: "12px",
    },
    subtaskItem: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "4px 0",
    },
    subtaskText: (done) => ({
      fontSize: "13px",
      color: done ? textMuted : text,
      textDecoration: done ? "line-through" : "none",
      flex: 1,
    }),
    editInput: {
      background: surfaceHover,
      border: `1px solid ${accent}`,
      color: text,
      borderRadius: "8px",
      padding: "4px 10px",
      fontSize: "15px",
      fontWeight: "500",
      flex: 1,
      outline: "none",
      fontFamily: "inherit",
    },
    emptyState: {
      textAlign: "center",
      padding: "60px 20px",
      color: textMuted,
    },
    footer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "20px",
      padding: "0 4px",
    },
    footerText: { fontSize: "12px", color: textMuted },
    clearBtn: {
      background: "transparent",
      border: "none",
      color: textMuted,
      cursor: "pointer",
      fontSize: "12px",
      fontFamily: "inherit",
      padding: "4px 8px",
      borderRadius: "6px",
      transition: "color 0.2s",
    },
  };

  return (
    <div style={styles.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::placeholder { color: ${textMuted}; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        .todo-card { animation: slideIn 0.25s ease forwards; }
        .add-btn:hover { transform: translateY(-1px) !important; box-shadow: 0 6px 20px rgba(192,132,252,0.5) !important; }
        .icon-btn:hover { background: ${surfaceHover} !important; color: ${text} !important; }
        .action-btn:hover { background: ${surfaceHover} !important; color: ${text} !important; }
        .clear-btn:hover { color: #f87171 !important; }
        .filter-btn:hover { border-color: ${accent} !important; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: ${darkMode ? "invert(1)" : "none"}; cursor: pointer; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${border}; border-radius: 99px; }
      `}</style>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.logo}>Taskflow</div>
            <div style={styles.subtitle}>{stats.active} task{stats.active !== 1 ? "s" : ""} remaining · {completionPct}% done</div>
          </div>
          <div style={styles.headerRight}>
            <button className="icon-btn" style={styles.iconBtn} onClick={() => setShowStats(s => !s)}>
              {showStats ? "📊 Hide" : "📊 Stats"}
            </button>
            <button className="icon-btn" style={styles.iconBtn} onClick={() => setDarkMode(d => !d)}>
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* Stats */}
        {showStats && (
          <div style={styles.statsBar}>
            {[
              { num: stats.total, label: "Total", color: accent },
              { num: stats.active, label: "Active", color: "#60a5fa" },
              { num: stats.completed, label: "Done", color: "#4ade80" },
              { num: stats.high, label: "Urgent", color: "#f87171" },
            ].map(s => (
              <div key={s.label} style={styles.statCard}>
                <div style={{ ...styles.statNum, color: s.color }}>{s.num}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Progress */}
        <div style={styles.progressBar}><div style={styles.progressFill} /></div>

        {/* Input */}
        <div style={{ ...styles.inputCard, animation: shake ? "shake 0.4s ease" : "none" }}>
          <input
            ref={inputRef}
            style={styles.mainInput}
            placeholder="What needs to be done?"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTodo()}
          />
          <div style={styles.inputRow}>
            <select style={styles.select} value={priority} onChange={e => setPriority(e.target.value)}>
              {PRIORITIES.map(p => <option key={p} value={p}>{priorityConfig[p].dot} {priorityConfig[p].label}</option>)}
            </select>
            <select style={styles.select} value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="date"
              style={styles.dateInput}
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
            <button className="add-btn" style={styles.addBtn} onClick={addTodo}>+ Add</button>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filterRow}>
          {FILTERS.map(f => (
            <button key={f} className="filter-btn" style={styles.filterBtn(filter === f)} onClick={() => setFilter(f)}>{f}</button>
          ))}
          <button className="filter-btn" style={styles.filterBtn(categoryFilter !== "All")} onClick={() => setCategoryFilter("All")}>All Categories</button>
          {CATEGORIES.map(c => (
            <button key={c} className="filter-btn" style={{ ...styles.filterBtn(categoryFilter === c), display: categoryFilter === c || categoryFilter === "All" ? "block" : "none" }} onClick={() => setCategoryFilter(categoryFilter === c ? "All" : c)}>{c}</button>
          ))}
        </div>

        <div style={styles.filterRow}>
          <input style={styles.searchInput} placeholder="🔍  Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
          <select style={styles.sortSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="created">Newest</option>
            <option value="priority">Priority</option>
            <option value="alpha">A–Z</option>
          </select>
        </div>

        {/* Todos */}
        <div style={styles.todoList}>
          {filtered.length === 0 && (
            <div style={styles.emptyState}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>✨</div>
              <div style={{ fontWeight: "600", marginBottom: "4px" }}>All clear!</div>
              <div style={{ fontSize: "13px" }}>Add a task to get started</div>
            </div>
          )}

          {filtered.map(todo => {
            const pCfg = priorityConfig[todo.priority];
            const expanded = expandedId === todo.id;
            const subDone = todo.subtasks.filter(s => s.done).length;

            return (
              <div key={todo.id} className="todo-card" style={styles.todoCard(todo.completed, todo.pinned)}>
                <div style={styles.todoMain}>
                  {/* Checkbox */}
                  <div style={styles.checkbox(todo.completed)} onClick={() => toggleTodo(todo.id)}>
                    {todo.completed && <span style={{ fontSize: "12px", color: "#fff" }}>✓</span>}
                  </div>

                  {/* Text */}
                  {editId === todo.id ? (
                    <input
                      style={styles.editInput}
                      value={editText}
                      autoFocus
                      onChange={e => setEditText(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") saveEdit(todo.id); if (e.key === "Escape") setEditId(null); }}
                      onBlur={() => saveEdit(todo.id)}
                    />
                  ) : (
                    <span style={styles.todoText(todo.completed)} onDoubleClick={() => { setEditId(todo.id); setEditText(todo.text); }}>
                      {todo.pinned && <span style={{ marginRight: "6px" }}>📌</span>}
                      {todo.text}
                    </span>
                  )}

                  {/* Badges */}
                  <span style={styles.badge(pCfg.color)}>{pCfg.label}</span>

                  {/* Actions */}
                  <button className="action-btn" style={styles.actionBtn} onClick={() => setExpandedId(expanded ? null : todo.id)} title="Expand">{expanded ? "▲" : "▼"}</button>
                  <button className="action-btn" style={styles.actionBtn} onClick={() => pinTodo(todo.id)} title="Pin">{todo.pinned ? "📌" : "📍"}</button>
                  <button className="action-btn" style={styles.actionBtn} onClick={() => { setEditId(todo.id); setEditText(todo.text); }} title="Edit">✏️</button>
                  <button className="action-btn" style={{ ...styles.actionBtn, color: "#f87171" }} onClick={() => deleteTodo(todo.id)} title="Delete">✕</button>
                </div>

                {/* Meta */}
                <div style={styles.metaRow}>
                  <span style={{ ...styles.badge("#818cf8") }}>{todo.category}</span>
                  <span style={styles.metaText}>{formatDate(todo.createdAt)}</span>
                  {todo.dueDate && <span style={{ ...styles.metaText, color: "#f87171" }}>📅 {todo.dueDate}</span>}
                  {todo.subtasks.length > 0 && <span style={styles.metaText}>⬜ {subDone}/{todo.subtasks.length} subtasks</span>}
                </div>

                {/* Expanded */}
                {expanded && (
                  <div style={styles.expandedSection}>
                    {todo.subtasks.map(sub => (
                      <div key={sub.id} style={styles.subtaskItem}>
                        <div style={{ ...styles.checkbox(sub.done), width: "16px", height: "16px", borderRadius: "4px" }} onClick={() => toggleSubtask(todo.id, sub.id)}>
                          {sub.done && <span style={{ fontSize: "10px", color: "#fff" }}>✓</span>}
                        </div>
                        <span style={styles.subtaskText(sub.done)}>{sub.text}</span>
                        <button className="action-btn" style={{ ...styles.actionBtn, fontSize: "12px", color: "#f87171" }} onClick={() => deleteSubtask(todo.id, sub.id)}>✕</button>
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                      <input
                        style={{ ...styles.searchInput, flex: 1, padding: "4px 10px", fontSize: "12px" }}
                        placeholder="Add subtask..."
                        value={subtaskInput}
                        onChange={e => setSubtaskInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addSubtask(todo.id)}
                      />
                      <button style={{ ...styles.addBtn, padding: "4px 12px", fontSize: "12px", boxShadow: "none" }} onClick={() => addSubtask(todo.id)}>+</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {todos.length > 0 && (
          <div style={styles.footer}>
            <span style={styles.footerText}>{stats.active} active · {stats.completed} completed</span>
            {stats.completed > 0 && (
              <button className="clear-btn" style={styles.clearBtn} onClick={clearCompleted}>Clear completed</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
