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
  Package,
  Calendar,
  X,
  Check,
  AlertCircle
} from "lucide-react";

const steps = [
  { key: "subcategory", label: "Select Sub Category" },
  { key: "name", label: "Product Name", placeholder: "Eg: Organic Tomato" },
  { key: "image", label: "Product Image" },
  { key: "desc", label: "Product Description", placeholder: "Enter product details..." },
  { key: "contains", label: "Contains / Features", placeholder: "Eg: Vitamins, Minerals..." },
  { key: "pricing", label: "Pricing", placeholder: "Price and Discount" },
  { key: "meta", label: "Other Details", placeholder: "Tax and Delivery Time" },
  { key: "order", label: "Sort Order", placeholder: "9999" },
];

const Products = () => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [step, setStep] = useState(0);
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    subcategory: "",
    name: "",
    image: null,
    imagePreview: null,
    desc: "",
    contains: "",
    price: "",
    discountPrice: "",
    tax: "0",
    estimatedTime: "",
    sortOrder: "9999",
  });

  const fetchSubcategories = async () => {
    try {
      const res = await fetch("/api/subcategories");
      const data = await res.json();
      const subArray = data.subcategories || data.data || data || [];
      setSubcategories(Array.isArray(subArray) ? subArray : []);
    } catch (err) {
      console.error("Failed to fetch subcategories", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      const prodArray = data.data || data || [];
      setProducts(Array.isArray(prodArray) ? prodArray : []);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubcategories();
    fetchProducts();
  }, []);

  const next = () => step < steps.length - 1 && setStep(step + 1);
  const back = () => step > 0 && setStep(step - 1);

  const openModal = (prod = null) => {
    if (prod) {
      setEditingId(prod.id);
      setForm({
        subcategory: prod.subcategory_name,
        name: prod.product_name,
        image: null,
        imagePreview: prod.product_image ? `/uploads/${prod.product_image}` : null,
        desc: prod.product_desc || "",
        contains: prod.contains || "",
        price: prod.product_price || "",
        discountPrice: prod.product_discount_price || "",
        tax: prod.tax_percentage || "0",
        estimatedTime: prod.estimated_time || "",
        sortOrder: prod.sort_order || "9999",
      });
    } else {
      setEditingId(null);
      setForm({
        subcategory: "",
        name: "",
        image: null,
        imagePreview: null,
        desc: "",
        contains: "",
        price: "",
        discountPrice: "",
        tax: "0",
        estimatedTime: "",
        sortOrder: "9999",
      });
    }
    setStep(0);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditingId(null);
    setStep(0);
  };

  const handleSave = async () => {
    try {
      const selectedSub = subcategories.find(s => s.subcategory_name === form.subcategory);
      const subcategory_id = selectedSub ? selectedSub.id : null;

      if (!subcategory_id) {
        alert("Please select a subcategory");
        return;
      }

      const fd = new FormData();
      fd.append("subcategory_id", subcategory_id);
      fd.append("product_name", form.name);
      if (form.image) fd.append("product_image", form.image);
      fd.append("product_desc", form.desc);
      fd.append("contains", form.contains);
      fd.append("product_price", form.price);
      fd.append("product_discount_price", form.discountPrice);
      fd.append("tax_percentage", form.tax);
      fd.append("estimated_time", form.estimatedTime);
      fd.append("sort_order", form.sortOrder);

      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, { method, body: fd });
      const result = await res.json();

      if (result.success) {
        closeModal();
        fetchProducts();
      } else {
        alert("Action failed!");
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const toggleStatus = async (id, currentValue) => {
    try {
      const newValue = currentValue ? 0 : 1;
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_status: newValue }),
      });
      const result = await res.json();
      if (result.success) fetchProducts();
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) fetchProducts();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Product Catalog</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage and organize your store's inventory.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all duration-200"
        >
          <Plus size={20} />
          <span>Add New Product</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-semibold text-xs uppercase tracking-widest">Loading inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center gap-4 text-gray-300">
            <Package size={48} strokeWidth={1} />
            <p className="text-gray-500 font-semibold">Your catalog is currently empty.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4">Product Details</th>
                  <th className="px-6 py-4 text-center">Pricing</th>
                  <th className="px-6 py-4 text-center">Specifications</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="shrink-0">
                          {p.product_image ? (
                            <img
                              src={`/uploads/${p.product_image}`}
                              alt={p.product_name}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-100"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 border border-gray-100">
                              <ImageIcon size={20} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{p.product_name}</p>
                          <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded border border-indigo-100 mt-1">
                            {p.subcategory_name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center leading-tight">
                      <p className="text-xs text-gray-400 line-through">₹{p.product_price}</p>
                      <p className="text-sm font-bold text-indigo-600">₹{p.product_discount_price || p.product_price}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1 text-[11px] font-semibold text-gray-500">
                        <p><span className="text-gray-400 uppercase mr-1">Tax:</span> {p.tax_percentage}%</p>
                        <p><span className="text-gray-400 uppercase mr-1">Time:</span> {p.estimated_time || "N/A"}</p>
                        <p><span className="text-gray-400 uppercase mr-1">Rank:</span> {p.sort_order}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleStatus(p.id, p.product_status)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${p.product_status ? "bg-emerald-500 shadow-sm shadow-emerald-100" : "bg-gray-200"}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${p.product_status ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(p)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => deleteProduct(p.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
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

      {/* Product Management Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 border border-gray-100">
            <div className="px-8 pt-8 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? "Update Product" : "Add New Product"}
                </h2>
                <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mt-1">
                  Step {step + 1} of {steps.length} • {steps[step].label}
                </p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="px-8 pb-6">
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex gap-1">
                {steps.map((_, i) => (
                  <div key={i} className={`h-full flex-1 transition-all duration-300 ${i <= step ? "bg-indigo-600" : "bg-gray-200"}`} />
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-2">
              <div className="space-y-6">
                {step === 0 && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider uppercase">Category</label>
                    <select
                      value={form.subcategory}
                      onChange={(e) => { setForm({ ...form, subcategory: e.target.value }); next(); }}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-semibold"
                    >
                      <option value="">Select sub category...</option>
                      {subcategories.map(s => <option key={s.id} value={s.subcategory_name}>{s.subcategory_name}</option>)}
                    </select>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider uppercase">Product Name</label>
                    <input
                      autoFocus
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && next()}
                      placeholder="Enter product name..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-semibold"
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider uppercase">Display Image</label>
                    <div className="relative aspect-square w-48 mx-auto flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer overflow-hidden p-2">
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        id="image-upload"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) setForm({ ...form, image: file, imagePreview: URL.createObjectURL(file) });
                        }}
                      />
                      <label htmlFor="image-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                        {form.imagePreview ? (
                          <img src={form.imagePreview} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <div className="text-center">
                            <ImageIcon size={32} className="text-gray-400 mx-auto mb-2" />
                            <span className="text-xs font-bold text-gray-400 uppercase">Upload Image</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider uppercase">Description</label>
                    <textarea
                      rows={5}
                      autoFocus
                      value={form.desc}
                      onChange={(e) => setForm({ ...form, desc: e.target.value })}
                      placeholder="Provide detailed description..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-semibold resize-none"
                    />
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider uppercase">Product Features</label>
                    <textarea
                      rows={5}
                      autoFocus
                      value={form.contains}
                      onChange={(e) => setForm({ ...form, contains: e.target.value })}
                      placeholder="List key features or ingredients..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-semibold resize-none"
                    />
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider uppercase mb-2 block">Regular Price (₹)</label>
                      <input type="number" placeholder="0.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-bold" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-indigo-700 uppercase tracking-wider uppercase mb-2 block">Discounted Price (₹)</label>
                      <input type="number" placeholder="0.00" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} className="w-full px-4 py-3 bg-indigo-50/30 border border-indigo-100 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-bold text-indigo-700" />
                    </div>
                  </div>
                )}

                {step === 6 && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider uppercase mb-2 block">Tax Percentage (%)</label>
                      <input type="number" placeholder="18" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-bold" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider uppercase mb-2 block">Delivery Estimate</label>
                      <input type="text" placeholder="e.g. 3-5 Business Days" value={form.estimatedTime} onChange={(e) => setForm({ ...form, estimatedTime: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-bold" />
                    </div>
                  </div>
                )}

                {step === 7 && (
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider uppercase block">Display Priority</label>
                    <input
                      type="number"
                      placeholder="999"
                      value={form.sortOrder}
                      onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && handleSave()}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-bold text-indigo-600 text-3xl text-center"
                    />
                    <div className="p-4 bg-amber-50 rounded-xl text-amber-700 text-xs font-medium border border-amber-100 flex gap-2 items-start">
                      <AlertCircle size={16} className="shrink-0" />
                      Lower values will prioritize this product's visibility on the storefront.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
              <div className="flex items-center gap-4">
                {step > 0 && (
                  <button onClick={back} className="p-3 bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 rounded-xl transition-all shadow-sm">
                    <ChevronLeft size={20} />
                  </button>
                )}
                <button onClick={closeModal} className="text-sm font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wider">
                  Cancel
                </button>
              </div>

              {step < steps.length - 1 ? (
                <button
                  onClick={next}
                  className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg shadow-gray-200 hover:bg-gray-800 transition-all flex items-center gap-2"
                >
                  Next Step <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  <Check size={20} />
                  {editingId ? "Update Product" : "Save Product"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Products;
