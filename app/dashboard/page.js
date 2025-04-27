"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndTasks = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          fetchTasks();
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error(error);
        router.push("/login");
      }
    };

    fetchUserAndTasks();
  }, [router]);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks/list");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error("Task çekme hatası:", error);
    }
  };

  const handleAddOrUpdateTask = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast("Başlık boş olamaz.", "danger");
      return;
    }

    try {
      if (editId) {
        // Düzenleme işlemi
        const res = await fetch(`/api/tasks/update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editId,
            title: title.trim(),
            description: description.trim(),
          }),
        });

        if (res.ok) {
          showToast("Görev güncellendi.", "success");
          setEditId(null);
        } else {
          showToast("Görev güncellenemedi.", "danger");
        }
      } else {
        // Yeni görev ekleme işlemi
        const res = await fetch("/api/tasks/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
          }),
        });

        if (res.ok) {
          showToast("Görev eklendi.", "success");
        } else {
          showToast("Görev eklenemedi.", "danger");
        }
      }

      setTitle("");
      setDescription("");
      fetchTasks();
    } catch (error) {
      console.error(error);
      showToast("Sunucu hatası.", "danger");
    }
  };

  const handleEditTask = (id, currentTitle, currentDescription) => {
    setEditId(id);
    setTitle(currentTitle);
    setDescription(currentDescription || "");
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await fetch(`/api/tasks/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId }),
      });

      if (res.ok) {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        showToast("Görev silindi.", "success");
      } else {
        showToast("Görev silinemedi.", "danger");
      }
    } catch (error) {
      console.error("Görev silme hatası:", error);
      showToast("Sunucu hatası.", "danger");
    }
  };

  const showToast = (msg, type) => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(""), 3000);
  };

  if (!user) return <p className='container mt-5'>Yükleniyor...</p>;

  return (
    <div className='container mt-5'>
      <div className='card p-4 shadow'>
        <h2 className='mb-3'>Dashboard</h2>
        <p>
          Hoşgeldin, <strong>{user.email}</strong>!
        </p>

        <h4>{editId ? "Görev Düzenle" : "Yeni Görev Ekle"}</h4>
        <form onSubmit={handleAddOrUpdateTask} className='mb-4'>
          <div className='mb-3'>
            <input
              type='text'
              className='form-control'
              placeholder='Görev Başlığı'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className='mb-3'>
            <textarea
              className='form-control'
              placeholder='Açıklama (opsiyonel)'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <button type='submit' className='btn btn-primary'>
            {editId ? "Görev Güncelle" : "Görev Ekle"}
          </button>
        </form>

        <h4>Görevlerim</h4>
        {tasks.length > 0 ? (
          <ul className='list-group'>
            {tasks.map((task) => (
              <li key={task.id} className='list-group-item'>
                <h5>{task.title}</h5>
                <p>{task.description}</p>
                <small className='text-muted'>
                  Eklenme: {new Date(task.created_at).toLocaleString()}
                </small>
                <div className='mt-2 d-flex gap-2'>
                  <button
                    className='btn btn-sm btn-warning'
                    onClick={() =>
                      handleEditTask(task.id, task.title, task.description)
                    }
                  >
                    Düzenle
                  </button>
                  <button
                    className='btn btn-sm btn-danger'
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Sil
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Henüz görev eklenmedi.</p>
        )}
      </div>

      {/* Toast Bildirimi */}
      {toastMessage.text && (
        <div
          className={`toast-container position-fixed bottom-0 end-0 p-3`}
          style={{ zIndex: 9999 }}
        >
          <div
            className={`toast show text-bg-${toastMessage.type}`}
            role='alert'
            aria-live='assertive'
            aria-atomic='true'
          >
            <div className='toast-body'>{toastMessage.text}</div>
          </div>
        </div>
      )}
    </div>
  );
}
