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
    const [draggedId, setDraggedId] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);
    const [sortBy, setSortBy] = useState("none"); // none / date / priority
    const [filterPriority, setFilterPriority] = useState("all"); // all / high / medium / low

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

    const handleDragStart = (e, id) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e, id) => {
        e.preventDefault();
        setDragOverId(id);
        e.dataTransfer.dropEffect = "move";
    };

    const handleDragLeave = () => {
        setDragOverId(null);
    };

    const handleDrop = (e, targetId) => {
        e.preventDefault();
        setDragOverId(null);
        
        if (draggedId === targetId) return;
        
        // const draggedIndex = filteredTodos.findIndex(t => t.id === draggedId);
        // const targetIndex = filteredTodos.findIndex(t => t.id === targetId);
        
        // إنشاء array جديد بالترتيب الجديد
        const newList = [...todoList];
        const draggedTodo = newList.find(t => t.id === draggedId);
        const targetTodo = newList.find(t => t.id === targetId);
        
        const draggedIdx = newList.indexOf(draggedTodo);
        const targetIdx = newList.indexOf(targetTodo);
        
        [newList[draggedIdx], newList[targetIdx]] = [newList[targetIdx], newList[draggedIdx]];
        
        setTodoList(newList);
        setDraggedId(null);
    };

    const handleDragEnd = () => {
        setDraggedId(null);
        setDragOverId(null);
    };

    const getSortedAndFiltered = () => {
        let result = [...filteredTodos];
        
        // Filter حسب الأولوية
        if (filterPriority !== "all") {
            result = result.filter(todo => todo.priority === filterPriority);
        }
        
        // Sort
        if (sortBy === "date") {
            result.sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });
        } else if (sortBy === "priority") {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        }
        
        return result;
    };

    const getStatistics = () => {
        const total = todoList.length;
        const completed = todoList.filter(t => t.done).length;
        const remaining = total - completed;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
        
        const byCategory = {
            study: todoList.filter(t => t.category === "study").length,
            work: todoList.filter(t => t.category === "work").length,
            sport: todoList.filter(t => t.category === "sport").length,
            home: todoList.filter(t => t.category === "home").length,
            other: todoList.filter(t => t.category === "other").length,
        };
        
        return { total, completed, remaining, percentage, byCategory };
    };

    const stats = getStatistics();

    const displayedTodos = getSortedAndFiltered();

    // Export (تحميل البيانات)
    const handleExport = () => {
        const dataStr = JSON.stringify(todoList, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `todos-${new Date().toLocaleDateString('ar-EG')}.json`;
        link.click();
    };

    // Import (رفع البيانات)
    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (Array.isArray(imported)) {
                    setTodoList(imported);
                    alert("✅ تم استيراد البيانات بنجاح!");
                } else {
                    alert("❌ صيغة الملف غير صحيحة!");
                }
            } catch (error) {
                alert("❌ خطأ في قراءة الملف!");
            }
        };
        reader.readAsText(file);
    };

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
                    <div className="flex gap-2 flex-wrap">
                        <button 
                            onClick={handleExport}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all hover:shadow-lg"
                        >
                            ⬇️ تحميل
                        </button>
                        <label className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-all hover:shadow-lg cursor-pointer">
                            ⬆️ رفع
                            <input 
                                type="file" 
                                accept=".json" 
                                onChange={handleImport}
                                className="hidden"
                            />
                        </label>
                    </div>
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
                                {/* Sorting */}
                <div className="mb-6">
                    <p className={`mb-2 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        ترتيب:
                    </p>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setSortBy("none")}
                            className={`px-4 py-2 rounded-lg font-bold transition-all ${sortBy === "none" ? 'bg-indigo-600 text-white' : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'}`}
                        >
                            كل
                        </button>
                        <button
                            onClick={() => setSortBy("date")}
                            className={`px-4 py-2 rounded-lg font-bold transition-all ${sortBy === "date" ? 'bg-indigo-600 text-white' : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'}`}
                        >
                            📅 حسب التاريخ
                        </button>
                        <button
                            onClick={() => setSortBy("priority")}
                            className={`px-4 py-2 rounded-lg font-bold transition-all ${sortBy === "priority" ? 'bg-indigo-600 text-white' : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'}`}
                        >
                            ⭐ حسب الأولوية
                        </button>
                    </div>
                </div>

                {/* Filter */}
                <div className="mb-6">
                    <p className={`mb-2 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        تصفية حسب الأولوية:
                    </p>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setFilterPriority("all")}
                            className={`px-4 py-2 rounded-lg font-bold transition-all ${filterPriority === "all" ? 'bg-indigo-600 text-white' : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'}`}
                        >
                            كل
                        </button>
                        <button
                            onClick={() => setFilterPriority("high")}
                            className={`px-4 py-2 rounded-lg font-bold transition-all ${filterPriority === "high" ? 'bg-red-600 text-white' : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'}`}
                        >
                            🔴 عالية
                        </button>
                        <button
                            onClick={() => setFilterPriority("medium")}
                            className={`px-4 py-2 rounded-lg font-bold transition-all ${filterPriority === "medium" ? 'bg-yellow-600 text-white' : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'}`}
                        >
                            🟡 وسط
                        </button>
                        <button
                            onClick={() => setFilterPriority("low")}
                            className={`px-4 py-2 rounded-lg font-bold transition-all ${filterPriority === "low" ? 'bg-green-600 text-white' : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'}`}
                        >
                            🟢 منخفضة
                        </button>
                    </div>
                </div>
                
                        {todoList.length > 0 && (
                            <div className={`rounded-lg p-6 mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
                                {/* Progress Bar */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                            نسبة الإنجاز
                                        </p>
                                        <p className={`text-lg font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                            {stats.percentage}%
                                        </p>
                                    </div>
                                    <div className={`w-full h-4 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                                        <div 
                                            className="h-full rounded-full bg-gradient-to-r from-green-500 to-indigo-600 transition-all duration-500"
                                            style={{ width: `${stats.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-white'}`}>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>✅ منتهية</p>
                                        <p className={`text-2xl font-bold text-green-500`}>{stats.completed}</p>
                                    </div>
                                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-white'}`}>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>⏳ متبقية</p>
                                        <p className={`text-2xl font-bold text-orange-500`}>{stats.remaining}</p>
                                    </div>
                                </div>

                                {/* By Category */}
                                <div>
                                    <p className={`font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                        حسب الفئة:
                                    </p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {stats.byCategory.study > 0 && (
                                            <div className={`p-2 rounded text-sm font-bold ${isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                                                📚 {stats.byCategory.study}
                                            </div>
                                        )}
                                        {stats.byCategory.work > 0 && (
                                            <div className={`p-2 rounded text-sm font-bold ${isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'}`}>
                                                💼 {stats.byCategory.work}
                                            </div>
                                        )}
                                        {stats.byCategory.sport > 0 && (
                                            <div className={`p-2 rounded text-sm font-bold ${isDarkMode ? 'bg-pink-900 text-pink-200' : 'bg-pink-100 text-pink-800'}`}>
                                                🏃 {stats.byCategory.sport}
                                            </div>
                                        )}
                                        {stats.byCategory.home > 0 && (
                                            <div className={`p-2 rounded text-sm font-bold ${isDarkMode ? 'bg-orange-900 text-orange-200' : 'bg-orange-100 text-orange-800'}`}>
                                                🏠 {stats.byCategory.home}
                                            </div>
                                        )}
                                        {stats.byCategory.other > 0 && (
                                            <div className={`p-2 rounded text-sm font-bold ${isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-800'}`}>
                                                ❓ {stats.byCategory.other}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                {/* Todo List */}
                <div className={`rounded-lg p-4 mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    {filteredTodos.length === 0 ? (
                        <p className={`text-center py-8 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {todoList.length === 0 ? "لا توجد مهام! 🎉" : "لا توجد نتائج بحث 🔍"}
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {displayedTodos.map((todo) => (
                                                            <li 
                                key={todo.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, todo.id)}
                                onDragOver={(e) => handleDragOver(e, todo.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, todo.id)}
                                onDragEnd={handleDragEnd}
                                className={`flex flex-col gap-3 p-4 rounded-lg border-l-4 transition-all duration-300 cursor-grab active:cursor-grabbing ${
                                                    draggedId === todo.id ? 'opacity-50 scale-95' : 'opacity-100'
                                                } ${
                                                    dragOverId === todo.id && draggedId !== todo.id ? 'border-yellow-500 bg-yellow-100' : ''
                                                } ${
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