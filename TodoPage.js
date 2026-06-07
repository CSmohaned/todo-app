import { useState, useEffect, useRef } from "react";

function TodoPage() {
    const [todoList, setTodoList] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [priority, setPriority] = useState("medium");
    const [category, setCategory] = useState("other");
    const [dueDate, setDueDate] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");
    const [editDate, setEditDate] = useState("");
    const [editPriority, setEditPriority] = useState("medium");
    const [editCategory, setEditCategory] = useState("other");
    const isFirstRender = useRef(true);

    useEffect(() => {
        const saved = localStorage.getItem("todos");
        if (saved) {
            setTodoList(JSON.parse(saved));
        }
        const savedDarkMode = localStorage.getItem("darkMode");
        if (savedDarkMode) {
            setIsDarkMode(JSON.parse(savedDarkMode));
        }
    }, []);
    
    useEffect(() => {
        localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        localStorage.setItem("todos", JSON.stringify(todoList));
    }, [todoList]);
    
    const handleAddTodo = () => {
        if (inputValue.trim() === "") {
            alert("⚠️ الرجاء كتابة مهمة!");
            return;
        }
        
        const newTodo = {
            id: Date.now(),
            text: inputValue,
            done: false,
            priority: priority,
            category: category,
            dueDate: dueDate
        };
        
        setTodoList([...todoList, newTodo]);
        setInputValue("");
        setPriority("medium");
        setCategory("other");
        setDueDate("");
    };
    
    const handleDeleteTodo = (id) => {
        const newList = todoList.filter(todo => todo.id !== id);
        setTodoList(newList);
    };
    
    const handleToggleTodo = (id) => {
        const newList = todoList.map(todo =>
            todo.id === id 
                ? { ...todo, done: !todo.done }
                : todo
        );
        setTodoList(newList);
    };
    
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleAddTodo();
        }
    };

    const startEdit = (id, text, date, priority, category) => {
        setEditingId(id);
        setEditText(text);
        setEditDate(date || "");
        setEditPriority(priority);
        setEditCategory(category);
    };

    const handleSaveEdit = (id) => {
        if (editText.trim() === "") {
            alert("المهمة لا يمكن أن تكون فارغة!");
            return;
        }
        
        const newList = todoList.map(todo =>
            todo.id === id 
                ? { 
                    ...todo, 
                    text: editText,
                    dueDate: editDate,
                    priority: editPriority,
                    category: editCategory
                }
                : todo
        );
        
        setTodoList(newList);
        setEditingId(null);
        setEditText("");
        setEditDate("");
        setEditPriority("medium");
        setEditCategory("other");
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditText("");
        setEditDate("");
        setEditPriority("medium");
        setEditCategory("other");
    };

    const filteredTodos = todoList.filter(todo => 
        todo.text.toLowerCase().includes(searchValue.toLowerCase())
    );
    
    return (
        <div className={`min-h-screen py-8 px-4 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-500 to-purple-700'}`}>
            <div className={`max-w-2xl mx-auto p-8 rounded-2xl shadow-2xl transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        📝 تطبيقي للمهام
                    </h1>
                    <button 
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 hover:-translate-y-1 ${isDarkMode ? 'bg-yellow-500 text-gray-900 hover:shadow-lg' : 'bg-indigo-600 text-white hover:shadow-lg'}`}
                    >
                        {isDarkMode ? "☀️ Light" : "🌙 Dark"}
                    </button>
                </div>
                
                {/* Input Container */}
                <div className="flex flex-col gap-3 mb-8">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="اكتب مهمة جديدة..."
                            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:-translate-y-1 focus:shadow-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-indigo-500'}`}
                        />
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:-translate-y-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500' : 'bg-white border-gray-300 focus:border-indigo-500'}`}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <select 
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none cursor-pointer ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500' : 'bg-white border-gray-300 focus:border-indigo-500'}`}
                        >
                            <option value="high">🔴 عالية</option>
                            <option value="medium">🟡 وسط</option>
                            <option value="low">🟢 منخفضة</option>
                        </select>
                        
                        <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none cursor-pointer ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500' : 'bg-white border-gray-300 focus:border-indigo-500'}`}
                        >
                            <option value="study">📚 الدراسة</option>
                            <option value="work">💼 العمل</option>
                            <option value="sport">🏃 الرياضة</option>
                            <option value="home">🏠 المنزل</option>
                            <option value="other">❓ أخرى</option>
                        </select>
                        
                        <button 
                            onClick={handleAddTodo}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 whitespace-nowrap"
                        >
                            إضافة
                        </button>
                    </div>
                </div>

                {/* Search */}
                <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="🔍 ابحث عن مهمة..."
                    className={`w-full px-4 py-3 rounded-lg border-2 mb-6 transition-all duration-300 focus:outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500' : 'bg-white border-gray-300 placeholder-gray-500 focus:border-indigo-500'}`}
                />
                
                {/* Todo List */}
                <div className={`rounded-lg p-4 mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    {filteredTodos.length === 0 ? (
                        <p className={`text-center py-8 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {todoList.length === 0 ? "لا توجد مهام! 🎉" : "لا توجد نتائج بحث 🔍"}
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {filteredTodos.map((todo) => (
                                <li 
                                    key={todo.id} 
                                    className={`flex flex-col gap-3 p-4 rounded-lg border-l-4 transition-all duration-300 animate-slideIn ${
                                        isDarkMode 
                                            ? `${todo.done ? 'bg-gray-600 opacity-60 border-gray-500' : 'bg-gray-600 border-indigo-500'}` 
                                            : `${todo.done ? 'bg-gray-100 opacity-60 border-gray-300' : 'bg-white border-indigo-500'}`
                                    } hover:shadow-lg hover:translate-x-1`}
                                >
                                    {editingId === todo.id ? (
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <input
                                                type="checkbox"
                                                checked={todo.done}
                                                onChange={() => handleToggleTodo(todo.id)}
                                                className="w-6 h-6 cursor-pointer accent-indigo-600 flex-shrink-0"
                                            />
                                            <input
                                                type="text"
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                className={`flex-1 px-3 py-2 rounded border-2 border-indigo-500 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}
                                            />
                                            <input
                                                type="date"
                                                value={editDate}
                                                onChange={(e) => setEditDate(e.target.value)}
                                                className={`px-3 py-2 rounded border-2 border-indigo-500 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}
                                            />
                                            <select 
                                                value={editPriority}
                                                onChange={(e) => setEditPriority(e.target.value)}
                                                className={`px-3 py-2 rounded border-2 border-indigo-500 cursor-pointer ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}
                                            >
                                                <option value="high">🔴</option>
                                                <option value="medium">🟡</option>
                                                <option value="low">🟢</option>
                                            </select>
                                            <select 
                                                value={editCategory}
                                                onChange={(e) => setEditCategory(e.target.value)}
                                                className={`px-3 py-2 rounded border-2 border-indigo-500 cursor-pointer ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}
                                            >
                                                <option value="study">📚</option>
                                                <option value="work">💼</option>
                                                <option value="sport">🏃</option>
                                                <option value="home">🏠</option>
                                                <option value="other">❓</option>
                                            </select>
                                            <button 
                                                onClick={() => handleSaveEdit(todo.id)} 
                                                className="px-4 py-2 bg-green-500 text-white rounded font-bold hover:bg-green-600 transition-colors whitespace-nowrap"
                                            >
                                                ✓ حفظ
                                            </button>
                                            <button 
                                                onClick={handleCancelEdit} 
                                                className="px-4 py-2 bg-red-500 text-white rounded font-bold hover:bg-red-600 transition-colors whitespace-nowrap"
                                            >
                                                ✕ إلغاء
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
                                            <input
                                                type="checkbox"
                                                checked={todo.done}
                                                onChange={() => handleToggleTodo(todo.id)}
                                                className="w-6 h-6 cursor-pointer accent-indigo-600 flex-shrink-0"
                                            />
                                            <span className={`flex-1 text-lg transition-all ${todo.done ? 'line-through opacity-60' : ''} ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                                {todo.text}
                                            </span>
                                            {todo.dueDate && (
                                                <span className={`px-3 py-1 rounded text-sm whitespace-nowrap font-semibold ${isDarkMode ? 'bg-gray-500 text-white' : 'bg-gray-300 text-gray-800'}`}>
                                                    📅 {new Date(todo.dueDate).toLocaleDateString('ar-EG')}
                                                </span>
                                            )}
                                            <span className={`px-3 py-1 rounded text-sm font-bold whitespace-nowrap ${
                                                todo.priority === 'high' ? (isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800') :
                                                todo.priority === 'medium' ? (isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800') :
                                                isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                                            }`}>
                                                {todo.priority === "high" && "🔴 عالية"}
                                                {todo.priority === "medium" && "🟡 وسط"}
                                                {todo.priority === "low" && "🟢 منخفضة"}
                                            </span>
                                            <span className={`px-3 py-1 rounded text-sm font-bold whitespace-nowrap ${
                                                todo.category === 'study' ? (isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800') :
                                                todo.category === 'work' ? (isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800') :
                                                todo.category === 'sport' ? (isDarkMode ? 'bg-pink-900 text-pink-200' : 'bg-pink-100 text-pink-800') :
                                                todo.category === 'home' ? (isDarkMode ? 'bg-orange-900 text-orange-200' : 'bg-orange-100 text-orange-800') :
                                                isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-800'
                                            }`}>
                                                {todo.category === "study" && "📚 الدراسة"}
                                                {todo.category === "work" && "💼 العمل"}
                                                {todo.category === "sport" && "🏃 الرياضة"}
                                                {todo.category === "home" && "🏠 المنزل"}
                                                {todo.category === "other" && "❓ أخرى"}
                                            </span>
                                            <button 
                                                onClick={() => startEdit(todo.id, todo.text, todo.dueDate, todo.priority, todo.category)} 
                                                className="px-4 py-2 bg-blue-500 text-white rounded font-bold hover:bg-blue-600 transition-colors hover:animate-bounce"
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteTodo(todo.id)} 
                                                className="px-4 py-2 bg-red-500 text-white rounded font-bold hover:bg-red-600 transition-colors hover:animate-bounce"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                
                {/* Stats */}
                {todoList.length > 0 && (
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-lg text-center font-bold text-lg hover:shadow-lg transition-all">
                        المهام المتبقية: {todoList.filter(t => !t.done).length} / {todoList.length}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TodoPage;