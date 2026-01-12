import { useState, useEffect } from "react";
import Layout from "../Layout";

const steps = [
  { key: "category", label: "Select Category" },
  { key: "name", label: "Sub Category Name", placeholder: "Eg: Kitchen Cleaners" },
  { key: "slug", label: "Slug", placeholder: "kitchen-cleaners" },
  { key: "image", label: "Sub Category Image" },
  { key: "metaTitle", label: "Meta Title", placeholder: "SEO title" },
  { key: "metaDescription", label: "Meta Description" },
];

const SubCategory = () => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [step, setStep] = useState(0);
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    category: "",
    name: "",
    slug: "",
    image: null,
    imagePreview: null,
    metaTitle: "",
    metaDescription: "",
  });

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      // Handle response format { success: true, categories: [...] }
      const catArray = data.categories || data || [];
      setCategories(Array.isArray(catArray) ? catArray : []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
      setCategories([]);
    }
  };

  // Fetch subcategories from backend
  const fetchSubcategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/subcategories");
      const data = await res.json();
      // Handle response format { success: true, subcategories: [...] }
      const subArray = data.subcategories || data || [];
      console.log("Subcategories fetched:", subArray); // Debug log
      setSubcategories(Array.isArray(subArray) ? subArray : []);
    } catch (err) {
      console.error("Failed to fetch subcategories", err);
      setSubcategories([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
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

  const openModal = (subcat = null) => {
    if (subcat) {
      setEditingId(subcat.id);
      setForm({
        category: subcat.category_name,
        name: subcat.subcategory_name,
        slug: subcat.slug,
        image: null,
        imagePreview: subcat.subcategory_image ? `/uploads/${subcat.subcategory_image}` : null,
        metaTitle: subcat.meta_title,
        metaDescription: subcat.meta_description,
      });
    } else {
      setEditingId(null);
      setForm({
        category: "",
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
      category: "",
      name: "",
      slug: "",
      image: null,
      imagePreview: null,
      metaTitle: "",
      metaDescription: "",
    });
  };

  // Send form data to backend and refresh list
  const handleSave = async () => {
    try {
      const selectedCat = categories.find(cat => cat.category_name === form.category);
      const category_id = selectedCat ? selectedCat.id : null;

      if (!category_id) {
        alert("Please select a valid category");
        return;
      }

      const fd = new FormData();
      fd.append("category_id", category_id);
      fd.append("subcategory_name", form.name);
      fd.append("slug", form.slug);
      if (form.image) fd.append("subcategory_image", form.image);
      fd.append("meta_title", form.metaTitle);
      fd.append("meta_description", form.metaDescription);
      fd.append("subcategory_status", 1);
      fd.append("status", 1);
      fd.append("sort_order", 0);

      const url = editingId ? `/api/subcategories/${editingId}` : "/api/subcategories";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: fd,
      });

      const result = await response.json();

      if (result.success) {
        alert(editingId ? "Subcategory updated successfully!" : "Subcategory added successfully!");
        closeModal();
        fetchSubcategories();
      } else {
        alert("Failed to save subcategory");
      }
    } catch (err) {
      console.error("Failed to save subcategory", err);
      alert("Error saving subcategory");
    }
  };

  const toggleStatus = async (id, currentValue) => {
    try {
      const newValue = currentValue ? 0 : 1;
      const response = await fetch(`/api/subcategories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subcategory_status: newValue
        }),
      });

      const result = await response.json();
      if (result.success) fetchSubcategories();
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const deleteSubcategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?")) return;

    try {
      const response = await fetch(`/api/subcategories/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (result.success) {
        alert("Subcategory deleted successfully!");
        fetchSubcategories();
      }
    } catch (err) {
      console.error("Failed to delete subcategory", err);
      alert("Error deleting subcategory");
    }
  };

  return (
    <Layout>
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Sub Categories
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your product sub-categories
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 rounded-lg bg-gradient-to-r
          from-green-500 to-emerald-600 text-white shadow hover:opacity-90"
        >
          + Add Sub Category
        </button>
      </div>

      {/* CONTENT */}
      <div className="mt-6 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">
          Sub Category Management
        </h2>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : subcategories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No subcategories found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Image</th>
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Slug</th>
                  <th className="px-4 py-3 text-left font-semibold">Meta Title</th>
                  <th className="px-4 py-3 text-left font-semibold">Meta Desc</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subcategories.map((sub) => (
                  <tr key={sub.id} className={`border-b transition-colors ${!sub.subcategory_status ? "bg-gray-50/50 text-gray-400 grayscale-[0.5]" : "hover:bg-gray-50"}`}>
                    <td className="px-4 py-3">
                      {sub.subcategory_image ? (
                        <img
                          src={`/uploads/${sub.subcategory_image}`}
                          alt={sub.subcategory_name}
                          className={`w-10 h-10 object-cover rounded shadow-sm border border-gray-200 ${!sub.subcategory_status ? "opacity-50" : ""}`}
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
                    <td className="px-4 py-3 font-medium">{sub.subcategory_name}</td>
                    <td className="px-4 py-3">{sub.category_name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{sub.slug}</td>
                    <td className="px-4 py-3 text-xs">{sub.meta_title || "-"}</td>
                    <td className="px-4 py-3 text-xs max-w-xs truncate">{sub.meta_description || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleStatus(sub.id, sub.subcategory_status)}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${sub.subcategory_status ? "bg-green-500" : "bg-gray-300"
                          }`}
                      >
                        <span
                          className={`inline-block h-7 w-7 transform rounded-full bg-white transition-transform ${sub.subcategory_status ? "translate-x-6" : "translate-x-0.5"
                            }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center space-x-1">
                      <button
                        onClick={() => openModal(sub)}
                        className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteSubcategory(sub.id)}
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

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 animate-[pop_0.3s_ease-out]">
            <div className="flex gap-2 mb-5">
              {steps.map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-green-500" : "bg-gray-200"}`} />
              ))}
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">{steps[step].label}</h2>

            <div className="min-h-[130px] animate-[slideUp_0.3s_ease]">
              {step === 0 && (
                <select autoFocus value={form.category} onChange={(e) => { setForm({ ...form, category: e.target.value }); next(); }} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="">Select Category</option>
                  {Array.isArray(categories) && categories.map((cat) => (
                    <option key={cat.id} value={cat.category_name}>{cat.category_name}</option>
                  ))}
                </select>
              )}

              {step === 1 && (
                <input autoFocus value={form.name} onChange={(e) => handleNameChange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && next()} placeholder={steps[1].placeholder} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
              )}

              {step === 2 && (
                <input autoFocus value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} onKeyDown={(e) => e.key === "Enter" && next()} placeholder={steps[2].placeholder} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
              )}

              {step === 3 && (
                <>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-green-400 rounded-lg p-6 text-green-600 cursor-pointer hover:bg-green-50">
                    <input type="file" accept="image/*" hidden onChange={(e) => { const file = e.target.files[0]; if (file) { const preview = URL.createObjectURL(file); setForm({ ...form, image: file, imagePreview: preview }); } }} />
                    📷 Upload Image
                  </label>
                  {form.imagePreview && (
                    <div className="mt-4 text-center">
                      <img src={form.imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg mx-auto" />
                      <p className="text-xs text-gray-500 mt-2">Preview (will update after save)</p>
                    </div>
                  )}
                </>
              )}

              {step === 4 && (
                <input autoFocus value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} onKeyDown={(e) => e.key === "Enter" && next()} placeholder={steps[4].placeholder} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
              )}

              {step === 5 && (
                <textarea rows={3} value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} placeholder="Meta description" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
              )}
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-4">
                {step > 0 && <button onClick={back} className="text-green-600 hover:text-green-800 text-lg">←</button>}
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">Cancel</button>
              </div>

              {step < steps.length - 1 ? (
                <button onClick={next} className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Next →</button>
              ) : (
                <button onClick={handleSave} className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">{editingId ? "Update" : "Save"} Sub Category</button>
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

export default SubCategory;