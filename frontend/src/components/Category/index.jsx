import { useState, useEffect } from "react";
import Layout from "../Layout";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  X,
  Check,
  Globe,
  Settings
} from "lucide-react";

const steps = [
  { key: "name", label: "Category Identity", placeholder: "Eg: Cleaning" },
  { key: "slug", label: "URL Handle", placeholder: "cleaning" },
  { key: "image", label: "Visual Asset" },
  { key: "metaTitle", label: "SEO Narrative", placeholder: "SEO title" },
  { key: "metaDescription", label: "Global Reach" },
];

const Category = () => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    image: null,
    imagePreview: null,
    metaTitle: "",
    metaDescription: "",
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      const catArray = data.categories || data || [];
      setCategories(Array.isArray(catArray) ? catArray : []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
      setCategories([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const next = () => step < steps.length - 1 && setStep(step + 1);
  const back = () => step > 0 && setStep(step - 1);

  const handleNameChange = (value) => {
    setForm({
      ...form,
      name: value,
      slug: value.toLowerCase().replace(/\s+/g, "-"),
    });
  };

  const openModal = (cat = null) => {
    if (cat) {
      setEditingId(cat.id);
      setForm({
        name: cat.category_name,
        slug: cat.slug,
        image: null,
        imagePreview: cat.category_image ? `/uploads/${cat.category_image}` : null,
        metaTitle: cat.meta_title,
        metaDescription: cat.meta_description,
      });
    } else {
      setEditingId(null);
      setForm({
        name: "",
        slug: "",
        image: null,
        imagePreview: null,
        metaTitle: "",
        metaDescription: "",
      });
    }
    setStep(0);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditingId(null);
    setStep(0);
    setForm({
      name: "",
      slug: "",
      image: null,
      imagePreview: null,
      metaTitle: "",
      metaDescription: "",
    });
  };

  const handleSave = async () => {
    try {
      if (!form.name.trim()) {
        alert("Please enter category name");
        return;
      }

      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("slug", form.slug);
      if (form.image) fd.append("image", form.image);
      fd.append("metaTitle", form.metaTitle);
      fd.append("metaDescription", form.metaDescription);

      const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, { method, body: fd });
      const result = await response.json();

      if (result.success) {
        closeModal();
        fetchCategories();
      } else {
        alert("Failed to save category");
      }
    } catch (err) {
      console.error("Failed to save category", err);
    }
  };

  const toggleStatus = async (id, currentValue) => {
    try {
      const newValue = currentValue ? 0 : 1;
      const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_status: newValue
        }),
      });

      const result = await response.json();
      if (result.success) fetchCategories();
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (result.success) {
        fetchCategories();
      }
    } catch (err) {
      console.error("Failed to delete category", err);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Main Categories</h1>
          <p className="text-gray-500 mt-1 font-medium italic">Define high-level grouping for your products.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all duration-200"
        >
          <Plus size={20} />
          <span>New Category</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Registry Overview</h2>
          <div className="relative max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Find category..."
              className="pl-8 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium tracking-widest uppercase text-[10px]">Synchronizing...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-3">
            <div className="p-4 bg-indigo-50 text-indigo-400 rounded-full">
              <FolderOpen size={40} />
            </div>
            <p className="text-gray-400 font-medium">No parent categories registered yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/30 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="px-6 py-4">Visual</th>
                  <th className="px-6 py-4">Structure</th>
                  <th className="px-6 py-4">Optimization</th>
                  <th className="px-6 py-4 text-center">Visibility</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {categories.map((cat) => (
                  <tr key={cat.id} className={`group hover:bg-gray-50/50 transition-colors ${!cat.category_status ? "bg-gray-50/30" : ""}`}>
                    <td className="px-6 py-4">
                      {cat.category_image ? (
                        <img
                          src={`/uploads/${cat.category_image}`}
                          alt={cat.category_name}
                          className={`w-12 h-12 object-cover rounded-xl shadow-sm border border-gray-100 transition-all ${!cat.category_status ? "grayscale opacity-50" : "group-hover:scale-110"}`}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border border-dashed border-gray-300 text-gray-400">
                          <ImageIcon size={18} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-bold ${!cat.category_status ? "text-gray-400" : "text-gray-900"}`}>{cat.category_name}</div>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono text-indigo-400 bg-indigo-50/50 w-fit px-1.5 py-0.5 rounded border border-indigo-100/50">
                        /{cat.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                          <span className="p-0.5 bg-gray-100 rounded text-gray-400"><Globe size={10} /></span>
                          {cat.meta_title || "No Meta Title set"}
                        </div>
                        <div className="text-[10px] text-gray-400 italic max-w-xs truncate">
                          {cat.meta_description || "Missing marketing meta description"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleStatus(cat.id, cat.category_status)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${cat.category_status ? "bg-indigo-500 shadow-md shadow-indigo-100" : "bg-gray-200"}`}
                      >
                        <span className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white transition-all duration-300 ${cat.category_status ? "translate-x-5.5" : "translate-x-1"}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(cat)}
                          className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Modify"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-gray-100">
            {/* Modal Header */}
            <div className="px-8 pt-8 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900 leading-tight">
                  {editingId ? "Update Category" : "Build Category"}
                </h2>
                <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest mt-1">
                  Step {step + 1} of {steps.length} • {steps[step].label}
                </p>
              </div>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-8 pb-6">
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                {steps.map((_, i) => (
                  <div key={i} className={`h-full flex-1 transition-all duration-500 ${i <= step ? "bg-indigo-600" : "bg-gray-200"}`} />
                ))}
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-8 py-2 custom-scrollbar">
              <div className="animate-in slide-in-from-right-4 duration-300">
                {step === 0 && (
                  <div className="space-y-4 py-4 text-center">
                    <label className="block text-left text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Label</label>
                    <input
                      autoFocus
                      value={form.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && next()}
                      placeholder={steps[0].placeholder}
                      className="w-full px-6 py-8 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-3xl outline-none transition-all font-black text-3xl text-gray-900 text-center shadow-inner"
                    />
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4 py-4">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Slug (URL Permanent Link)</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-300 font-bold">/</span>
                      <input
                        autoFocus
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && next()}
                        placeholder={steps[1].placeholder}
                        className="w-full pl-8 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-mono font-bold text-indigo-600 shadow-sm"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4 py-4 text-center">
                    <div className="group relative w-full aspect-square max-w-[200px] mx-auto border-4 border-dashed border-gray-100 rounded-[2.5rem] flex items-center justify-center hover:bg-indigo-50/30 hover:border-indigo-200 transition-all cursor-pointer overflow-hidden">
                      <input type="file" accept="image/*" hidden id="cat-img" onChange={(e) => { const file = e.target.files[0]; if (file) { setForm({ ...form, image: file, imagePreview: URL.createObjectURL(file) }); } }} />
                      <label htmlFor="cat-img" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                        {form.imagePreview ? (
                          <img src={form.imagePreview} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110" />
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <div className="p-4 bg-indigo-50 text-indigo-500 rounded-full">
                              <ImageIcon size={32} />
                            </div>
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Select Banner</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4 py-4">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Search Engine Optimal Title</label>
                    <input
                      autoFocus
                      value={form.metaTitle}
                      onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && next()}
                      placeholder={steps[3].placeholder}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800"
                    />
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit">
                      <Check size={12} strokeWidth={3} />
                      Optimized for indexing
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4 py-4">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Global Meta Description</label>
                    <textarea
                      rows={5}
                      value={form.metaDescription}
                      onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                      placeholder="Brief narrative for search engines..."
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-medium text-gray-800 resize-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 bg-gray-50/50 flex items-center justify-between mt-auto border-t border-gray-100">
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button onClick={back} className="p-3 bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-200 rounded-xl transition-all">
                    <ChevronLeft size={20} />
                  </button>
                )}
                <button onClick={closeModal} className="px-5 py-3 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest">
                  Cancel
                </button>
              </div>

              {step < steps.length - 1 ? (
                <button
                  onClick={next}
                  className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white font-bold rounded-2xl shadow-xl shadow-gray-200 hover:bg-gray-800 transition-all active:scale-95"
                >
                  Next <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  <Check size={20} />
                  {editingId ? "COMMIT" : "PUBLISH"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Category;