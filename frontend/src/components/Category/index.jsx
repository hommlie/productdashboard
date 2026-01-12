import { useState, useEffect } from "react";
import Layout from "../Layout";

const steps = [
  { key: "name", label: "Category Name", placeholder: "Eg: Cleaning" },
  { key: "slug", label: "Slug", placeholder: "cleaning" },
  { key: "image", label: "Category Image" },
  { key: "metaTitle", label: "Meta Title", placeholder: "SEO title" },
  { key: "metaDescription", label: "Meta Description" },
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
        alert(editingId ? "Category updated successfully!" : "Category added successfully!");
        closeModal();
        fetchCategories();
      } else {
        alert("Failed to save category");
      }
    } catch (err) {
      console.error("Failed to save category", err);
      alert("Error saving category");
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
        alert("Category deleted successfully!");
        fetchCategories();
      }
    } catch (err) {
      console.error("Failed to delete category", err);
      alert("Error deleting category");
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
          <p className="text-gray-500 mt-1">Manage your product categories</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow hover:opacity-90"
        >
          + Add Category
        </button>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Category Management</h2>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No categories found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Image</th>
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Slug</th>
                  <th className="px-4 py-3 text-left font-semibold">Meta Title</th>
                  <th className="px-4 py-3 text-left font-semibold">Meta Desc</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className={`border-b transition-colors ${!cat.category_status ? "bg-gray-50/50 text-gray-400 grayscale-[0.5]" : "hover:bg-gray-50"}`}>
                    <td className="px-4 py-3">
                      {cat.category_image ? (
                        <img
                          src={`/uploads/${cat.category_image}`}
                          alt={cat.category_name}
                          className={`w-10 h-10 object-cover rounded shadow-sm border border-gray-200 ${!cat.category_status ? "opacity-50" : ""}`}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center border border-dashed border-gray-300">
                          <span className="text-gray-400 text-[10px]">No img</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{cat.category_name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{cat.slug}</td>
                    <td className="px-4 py-3 text-xs">{cat.meta_title || "-"}</td>
                    <td className="px-4 py-3 text-xs max-w-xs truncate">{cat.meta_description || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleStatus(cat.id, cat.category_status)}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${cat.category_status ? "bg-blue-500" : "bg-gray-300"
                          }`}
                      >
                        <span
                          className={`inline-block h-7 w-7 transform rounded-full bg-white transition-transform ${cat.category_status ? "translate-x-6" : "translate-x-0.5"
                            }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center space-x-1">
                      <button
                        onClick={() => openModal(cat)}
                        className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 animate-[pop_0.3s_ease-out]">
            <div className="flex gap-2 mb-5">
              {steps.map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-blue-500" : "bg-gray-200"}`} />
              ))}
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">{steps[step].label}</h2>

            <div className="min-h-[130px] animate-[slideUp_0.3s_ease]">
              {step === 0 && (
                <input autoFocus value={form.name} onChange={(e) => handleNameChange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && next()} placeholder={steps[0].placeholder} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              )}

              {step === 1 && (
                <input autoFocus value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} onKeyDown={(e) => e.key === "Enter" && next()} placeholder={steps[1].placeholder} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              )}

              {step === 2 && (
                <>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-lg p-6 text-blue-600 cursor-pointer hover:bg-blue-50">
                    <input type="file" accept="image/*" hidden onChange={(e) => { const file = e.target.files[0]; if (file) { const preview = URL.createObjectURL(file); setForm({ ...form, image: file, imagePreview: preview }); } }} />
                    📷 Upload Image
                  </label>
                  {form.imagePreview && (
                    <div className="mt-4 text-center">
                      <img src={form.imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg mx-auto" />
                      <p className="text-xs text-gray-500 mt-2">{form.imagePreview.startsWith('blob:') ? 'New image (will update after save)' : 'Current image'}</p>
                    </div>
                  )}
                </>
              )}

              {step === 3 && (
                <input autoFocus value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} onKeyDown={(e) => e.key === "Enter" && next()} placeholder={steps[3].placeholder} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              )}

              {step === 4 && (
                <textarea rows={3} value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} placeholder="Meta description" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              )}
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-4">
                {step > 0 && <button onClick={back} className="text-blue-600 hover:text-blue-800 text-lg">←</button>}
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">Cancel</button>
              </div>

              {step < steps.length - 1 ? (
                <button onClick={next} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Next →</button>
              ) : (
                <button onClick={handleSave} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingId ? "Update" : "Save"} Category</button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </Layout>
  );
};

export default Category;