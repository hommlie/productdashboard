import { useState, useEffect } from "react";
import Layout from "../Layout";

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
        alert(editingId ? "Product updated!" : "Product added!");
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-500 mt-1">Manage your complete product catalog</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow hover:opacity-90"
        >
          + Add Product
        </button>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-md p-6">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2">
                <tr>
                  <th className="px-3 py-3 text-left">Image</th>
                  <th className="px-3 py-3 text-left">Product Name</th>
                  <th className="px-3 py-3 text-left">Sub Category</th>
                  <th className="px-3 py-3 text-left text-[10px] uppercase text-gray-400">Price / Disc.</th>
                  <th className="px-3 py-3 text-center text-[10px] uppercase text-gray-400">Tax %</th>
                  <th className="px-3 py-3 text-center text-[10px] uppercase text-gray-400">Time</th>
                  <th className="px-3 py-3 text-center text-[10px] uppercase text-gray-400">Order</th>
                  <th className="px-3 py-3 text-center">Status</th>
                  <th className="px-3 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className={`border-b transition-colors ${!p.product_status ? "bg-gray-50/50 text-gray-400 grayscale-[0.5]" : "hover:bg-gray-50"}`}>
                    <td className="px-3 py-3">
                      {p.product_image ? (
                        <img
                          src={`/uploads/${p.product_image}`}
                          alt={p.product_name}
                          className={`w-10 h-10 object-cover rounded shadow-sm border border-gray-200 ${!p.product_status ? "opacity-50" : ""}`}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center border border-dashed text-gray-400 text-[10px]">No img</div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-gray-800">{p.product_name}</div>
                      <div className="text-[10px] text-gray-400 max-w-[150px] truncate" title={p.product_desc}>{p.product_desc || "No description"}</div>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">{p.subcategory_name}</td>
                    <td className="px-3 py-3">
                      <div className="text-xs text-gray-400 line-through">₹{p.product_price}</div>
                      <div className="font-bold text-indigo-600">₹{p.product_discount_price || p.product_price}</div>
                    </td>
                    <td className="px-3 py-3 text-center text-xs font-mono">{p.tax_percentage}%</td>
                    <td className="px-3 py-3 text-center text-xs text-gray-500 truncate max-w-[80px]">{p.estimated_time || "-"}</td>
                    <td className="px-3 py-3 text-center text-xs text-gray-400">{p.sort_order}</td>
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => toggleStatus(p.id, p.product_status)}
                        className={`relative inline-flex h-8 w-13 items-center rounded-full transition-colors ${p.product_status ? "bg-indigo-500" : "bg-gray-300"}`}
                      >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${p.product_status ? "translate-x-6" : "translate-x-0.5"}`} />
                      </button>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex flex-col gap-1">
                        <button onClick={() => openModal(p)} className="px-2 py-1 bg-blue-500 text-white rounded-[4px] text-[10px] uppercase font-bold tracking-wider hover:bg-blue-600">Edit</button>
                        <button onClick={() => deleteProduct(p.id)} className="px-2 py-1 bg-red-500 text-white rounded-[4px] text-[10px] uppercase font-bold tracking-wider hover:bg-red-600">Delete</button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex gap-2 mb-5">
              {steps.map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-indigo-500" : "bg-gray-200"}`} />
              ))}
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">{steps[step].label}</h2>

            <div className="min-h-[160px]">
              {step === 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sub Category</label>
                  <select autoFocus value={form.subcategory} onChange={(e) => { setForm({ ...form, subcategory: e.target.value }); next(); }} className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-gray-100">
                    <option value="">Select Sub Category</option>
                    {subcategories.map(s => <option key={s.id} value={s.subcategory_name}>{s.subcategory_name}</option>)}
                  </select>
                </div>
              )}
              {step === 1 && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Product Name</label>
                  <input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} onKeyDown={(e) => e.key === "Enter" && next()} placeholder={steps[1].placeholder} className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-gray-100" />
                </div>
              )}
              {step === 2 && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Product Image</label>
                  <div className="flex flex-col items-center">
                    <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 rounded-xl p-6 text-indigo-400 cursor-pointer hover:bg-indigo-50 transition-colors">
                      <input type="file" accept="image/*" hidden onChange={(e) => { const file = e.target.files[0]; if (file) setForm({ ...form, image: file, imagePreview: URL.createObjectURL(file) }); }} />
                      <span className="text-2xl mb-1">📷</span>
                      <span className="text-sm font-semibold">Click to upload</span>
                    </label>
                    {form.imagePreview && <img src={form.imagePreview} className="mt-4 w-32 h-32 object-cover rounded-xl shadow-lg border-2 border-white" />}
                  </div>
                </div>
              )}
              {step === 3 && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</label>
                  <textarea rows={4} autoFocus value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder={steps[3].placeholder} className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-gray-100" />
                </div>
              )}
              {step === 4 && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contains / Features</label>
                  <textarea rows={4} autoFocus value={form.contains} onChange={(e) => setForm({ ...form, contains: e.target.value })} placeholder={steps[4].placeholder} className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-gray-100" />
                </div>
              )}
              {step === 5 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Actual Price (₹)</label>
                    <input type="number" placeholder="9.90" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-gray-100" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Discount Price (₹)</label>
                    <input type="number" placeholder="9.80" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-gray-100 shadow-sm" />
                  </div>
                </div>
              )}
              {step === 6 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tax Percentage (%)</label>
                    <input type="number" placeholder="5" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-gray-100" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Estimated Delivery</label>
                    <input type="text" placeholder="2-3 Days" value={form.estimatedTime} onChange={(e) => setForm({ ...form, estimatedTime: e.target.value })} className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-gray-100" />
                  </div>
                </div>
              )}
              {step === 7 && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sort Order</label>
                  <input type="number" placeholder="9999" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} onKeyDown={(e) => e.key === "Enter" && handleSave()} className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-gray-100" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-4">
                {step > 0 && <button onClick={back} className="text-indigo-600">←</button>}
                <button onClick={closeModal} className="text-gray-500">Cancel</button>
              </div>
              {step < steps.length - 1 ? (
                <button onClick={next} className="px-5 py-2 bg-indigo-600 text-white rounded-lg">Next →</button>
              ) : (
                <button onClick={handleSave} className="px-5 py-2 bg-indigo-600 text-white rounded-lg">{editingId ? "Update" : "Save"} Product</button>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Products;
