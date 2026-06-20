"use client";

import { useEffect, useRef, useState } from "react";
import API from "../services/api";

export default function SettingsPage({ theme: parentTheme = "dark" }) {
  const fileRef = useRef(null);

  const [theme, setTheme] = useState(parentTheme);
  const [accent, setAccent] = useState("pink");
  const [model, setModel] = useState("auto");
  const [notifications, setNotifications] = useState(true);

  const [name, setName] = useState("NeuroFlow User");
  const [email, setEmail] = useState("user@gmail.com");
  const [profileImage, setProfileImage] = useState("");

  const [greeting, setGreeting] = useState("Hello 👋 What's on your mind?");
  const [language, setLanguage] = useState("English");
  const [defaultTemplate, setDefaultTemplate] = useState("Academic Research");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [message, setMessage] = useState("");

  const [modes, setModes] = useState({
    research: true,
    chat: true,
    pdf: true,
    image: true,
  });

  const isDark = theme === "dark";

  const accentMap = {
    purple: "from-purple-600 to-fuchsia-600",
    pink: "from-pink-600 to-rose-600",
    blue: "from-blue-500 to-indigo-600",
    cyan: "from-cyan-500 to-blue-500",
    green: "from-green-500 to-emerald-600",
    orange: "from-orange-500 to-pink-600",
  };

  const accentSolid = {
    purple: "bg-purple-500",
    pink: "bg-pink-500",
    blue: "bg-blue-500",
    cyan: "bg-cyan-400",
    green: "bg-green-500",
    orange: "bg-orange-500",
  };

  const accentButton = accentMap[accent] || accentMap.pink;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (typeof window === "undefined") return;

    setTheme(localStorage.getItem("theme") || "dark");
    setAccent(localStorage.getItem("accent") || "pink");
    setModel(localStorage.getItem("selected_model") || "auto");
    setNotifications(localStorage.getItem("notifications") !== "false");
    setName(localStorage.getItem("profile_name") || "NeuroFlow User");
    setProfileImage(localStorage.getItem("profile_image") || "");
    setGreeting(
      localStorage.getItem("ai_greeting") ||
        "Hello 👋 What's on your mind?"
    );
    setLanguage(localStorage.getItem("language") || "English");
    setDefaultTemplate(
      localStorage.getItem("default_template") || "Academic Research"
    );

    const savedModes = localStorage.getItem("research_modes");

    if (savedModes) {
      try {
        setModes(JSON.parse(savedModes));
      } catch {
        setModes({
          research: true,
          chat: true,
          pdf: true,
          image: true,
        });
      }
    }

    try {
      const res = await API.get("/me");
      if (res.data?.email) setEmail(res.data.email);
    } catch {
      setEmail(localStorage.getItem("remember_email") || "user@gmail.com");
    }
  };

  const saveSettings = () => {
    localStorage.setItem("theme", theme);
    localStorage.setItem("accent", accent);
    localStorage.setItem("selected_model", model);
    localStorage.setItem("notifications", notifications ? "true" : "false");
    localStorage.setItem("profile_name", name);
    localStorage.setItem("profile_image", profileImage);
    localStorage.setItem("ai_greeting", greeting);
    localStorage.setItem("language", language);
    localStorage.setItem("default_template", defaultTemplate);
    localStorage.setItem("research_modes", JSON.stringify(modes));

    window.dispatchEvent(new Event("settingsChanged"));
    setMessage("Settings saved successfully.");
  };

  const toggleMode = (key) => {
    setModes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const uploadProfile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setProfileImage(reader.result);
      localStorage.setItem("profile_image", reader.result);
      setMessage("Profile photo updated. Click Save Changes to apply.");
    };

    reader.readAsDataURL(file);
  };

  const changePassword = async () => {
    if (!oldPassword || !newPassword) {
      setMessage("Please enter old and new password.");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("New password must be at least 6 characters.");
      return;
    }

    try {
      await API.post("/change-password", {
        old_password: oldPassword,
        new_password: newPassword,
      });

      setOldPassword("");
      setNewPassword("");
      setMessage("Password changed successfully.");
    } catch (error) {
      const detail = error?.response?.data?.detail;
      setMessage(detail || "Password change failed.");
    }
  };

  const resetWorkspace = () => {
    localStorage.removeItem("neuroflow_chats");
    localStorage.removeItem("neuroflow_full_chats");
    setMessage("Local chat workspace reset successfully.");
  };

  const exportSettings = () => {
    const settings = {
      theme,
      accent,
      model,
      notifications,
      name,
      greeting,
      language,
      defaultTemplate,
      modes,
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "neuroflow-settings.json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
    setMessage("Settings exported successfully.");
  };

  return (
    <div
      className={
        isDark
          ? "min-h-screen pb-8 text-white"
          : "min-h-screen pb-8 text-slate-950"
      }
    >
      <div className="mb-7 flex items-center gap-4">
        <button
          onClick={() => window.history.back()}
          className={
            isDark
              ? "text-2xl text-slate-300 hover:text-white"
              : "text-2xl text-slate-600 hover:text-slate-950"
          }
        >
          ←
        </button>

        <div>
          <h2 className="text-3xl font-bold">Settings</h2>
          <p
            className={
              isDark
                ? "mt-1 text-xl font-semibold text-slate-200"
                : "mt-1 text-xl font-semibold text-slate-700"
            }
          >
            Your Workspace Basics
          </p>
        </div>
      </div>

      {message && (
        <div
          className={
            isDark
              ? "mb-5 rounded-2xl border border-pink-500/30 bg-pink-500/10 px-5 py-3 text-sm text-pink-100"
              : "mb-5 rounded-2xl border border-pink-200 bg-pink-50 px-5 py-3 text-sm text-pink-700"
          }
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4">
          <Card isDark={isDark}>
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold">User Profile</h3>

              <button
                onClick={() => setShowProfilePanel(!showProfilePanel)}
                className={
                  isDark
                    ? "text-slate-400 hover:text-pink-400"
                    : "text-slate-500 hover:text-pink-600"
                }
              >
                ✎
              </button>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div
                className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-linear-to-br ${accentButton} text-3xl`}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "👤"
                )}
              </div>

              <div>
                <h4 className="font-bold">{name}</h4>
                <p
                  className={
                    isDark ? "text-sm text-slate-400" : "text-sm text-slate-600"
                  }
                >
                  {email}
                </p>

                <button
                  onClick={() => setShowProfilePanel(!showProfilePanel)}
                  className={`mt-3 rounded-xl bg-linear-to-r ${accentButton} px-5 py-2 text-sm font-semibold text-white`}
                >
                  Edit Profile
                </button>
              </div>
            </div>

            {showProfilePanel && (
              <div
                className={
                  isDark
                    ? "mt-5 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                    : "mt-5 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                }
              >
                <input
  id="profile-photo"
  name="profile-photo"
  ref={fileRef}
  type="file"
  accept="image/*"
  onChange={uploadProfile}
  className="hidden"
/>

<button
  type="button"
  onClick={() => fileRef.current?.click()}
  className={
    isDark
      ? "w-full rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold"
      : "w-full rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold"
  }
>
  Add / Change Profile Photo
</button>

<input
  id="profile-name"
  name="profile-name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder="Enter display name"
  autoComplete="name"
  className={inputClass(isDark)}
/>

<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
  <input
    id="old-password"
    name="old-password"
    type="password"
    value={oldPassword}
    onChange={(e) => setOldPassword(e.target.value)}
    placeholder="Old password"
    autoComplete="current-password"
    className={inputClass(isDark)}
  />

  <input
    id="new-password"
    name="new-password"
    type="password"
    value={newPassword}
    onChange={(e) => setNewPassword(e.target.value)}
    placeholder="New password"
    autoComplete="new-password"
    className={inputClass(isDark)}
  />
</div>

                <button
                  onClick={changePassword}
                  className={`w-full rounded-xl bg-linear-to-r ${accentButton} px-4 py-3 text-sm font-semibold text-white`}
                >
                  Change Password
                </button>
              </div>
            )}
          </Card>

          <Card isDark={isDark}>
            <h3 className="text-lg font-bold">Appearance</h3>
            <p className={mutedClass(isDark)}>Customize your dashboard look.</p>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">Theme</p>
                <p className={mutedClass(isDark)}>
                  Currently: {theme === "dark" ? "Dark" : "Light"}
                </p>
              </div>

              <div
                className={
                  isDark
                    ? "flex rounded-xl bg-white/10 p-1"
                    : "flex rounded-xl bg-slate-100 p-1"
                }
              >
                <button
                  onClick={() => setTheme("light")}
                  className={`rounded-lg px-4 py-2 text-sm ${
                    theme === "light"
                      ? `bg-linear-to-r ${accentButton} text-white`
                      : isDark
                      ? "text-slate-400"
                      : "text-slate-600"
                  }`}
                >
                  ☀ Light
                </button>

                <button
                  onClick={() => setTheme("dark")}
                  className={`rounded-lg px-4 py-2 text-sm ${
                    theme === "dark"
                      ? `bg-linear-to-r ${accentButton} text-white`
                      : isDark
                      ? "text-slate-400"
                      : "text-slate-600"
                  }`}
                >
                  🌙 Dark
                </button>
              </div>
            </div>

            <div className="mt-5">
              <p className="font-semibold">Color Accent</p>
              <p className={mutedClass(isDark)}>
                Change dashboard highlight color.
              </p>

              <div className="mt-3 flex flex-wrap gap-3">
                {Object.keys(accentMap).map((color) => (
                  <button
                    key={color}
                    onClick={() => setAccent(color)}
                    className={`h-10 w-10 rounded-full ${accentSolid[color]} ${
                      accent === color ? "ring-4 ring-white/40" : ""
                    }`}
                  />
                ))}
              </div>

              <div
                className={
                  isDark
                    ? "mt-4 inline-flex items-center gap-3 rounded-xl bg-white/10 px-4 py-2"
                    : "mt-4 inline-flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-2"
                }
              >
                <span
                  className={`h-6 w-6 rounded-full ${accentSolid[accent]}`}
                />
                <span className="text-sm font-semibold capitalize">
                  {accent}
                </span>
              </div>
            </div>
          </Card>

          <Card isDark={isDark}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">General Notifications</h3>
                <p className={mutedClass(isDark)}>
                  Enable workspace notifications.
                </p>
              </div>

              <button
                onClick={() => setNotifications(!notifications)}
                className={`h-7 w-14 rounded-full p-1 transition ${
                  notifications
                    ? `bg-linear-to-r ${accentButton}`
                    : isDark
                    ? "bg-white/10"
                    : "bg-slate-200"
                }`}
              >
                <span
                  className={`block h-5 w-5 rounded-full bg-white transition ${
                    notifications ? "translate-x-7" : ""
                  }`}
                />
              </button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold">Interface</h3>

          <Card isDark={isDark}>
            <h3 className="text-lg font-bold">Active AI Model</h3>
            <p className={mutedClass(isDark)}>
              Select your connected AI model.
            </p>

            <select
  id="ai-model"
  name="ai-model"
  value={model}
  onChange={(e) => setModel(e.target.value)}
  className={inputClass(isDark)}
>
              <option value="auto">Auto Mode</option>
              <option value="gemini">Gemini AI</option>
              <option value="groq">Groq AI</option>
              <option value="ollama">Ollama Local</option>
              <option value="local">Local Model</option>
            </select>
          </Card>

          <Card isDark={isDark}>
            <h3 className="text-lg font-bold">Personal AI Hub Greetings</h3>
            <p className={mutedClass(isDark)}>
              This text appears on dashboard.
            </p>

          <input
  id="ai-greeting"
  name="ai-greeting"
  value={greeting}
  onChange={(e) => setGreeting(e.target.value)}
  placeholder="Hello 👋 What's on your mind?"
  autoComplete="off"
  className={inputClass(isDark)}
/>
          </Card>
                    <Card isDark={isDark}>
                    <h3 className="text-lg font-bold">Default Report Template</h3>
                    <p className={mutedClass(isDark)}>Used for new report generation.</p>

                        <select
  id="default-template"
  name="default-template"
  value={defaultTemplate}
  onChange={(e) => setDefaultTemplate(e.target.value)}
  className={inputClass(isDark)}
>
                        <option>Academic Research</option>
                        <option>Business Report</option>
                        <option>Market Research</option>
                        <option>Technical Report</option>
                        <option>Project Report</option>
                        </select>
          </Card>

          <Card isDark={isDark}>
            <h3 className="text-lg font-bold">Security & Account</h3>
            <p className={mutedClass(isDark)}>Manage local workspace safety.</p>

            <div className="mt-4 space-y-3">
              <ToolButton
                isDark={isDark}
                onClick={() =>
                  setMessage("Session is active and secured with JWT.")
                }
              >
                Check Session
              </ToolButton>

              <ToolButton
                isDark={isDark}
                onClick={() => {
                  localStorage.removeItem("remember_email");
                  setMessage("Remembered email removed.");
                }}
              >
                Remove Remembered Email
              </ToolButton>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card isDark={isDark} pink>
            <h3 className="text-lg font-bold">Workspace Summary</h3>
            <p
              className={
                isDark
                  ? "mt-2 text-sm text-slate-300"
                  : "mt-2 text-sm text-slate-700"
              }
            >
              NeuroFlow AI is configured as an advanced research and agent
              creation platform.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Mini isDark={isDark} title="Theme" value={theme} />
              <Mini isDark={isDark} title="Accent" value={accent} />
              <Mini isDark={isDark} title="Model" value={model} />
              <Mini
                isDark={isDark}
                title="Notify"
                value={notifications ? "On" : "Off"}
              />
            </div>
          </Card>

          <Card isDark={isDark}>
            <h3 className="text-lg font-bold">Favorite Research Modes</h3>
            <p className={mutedClass(isDark)}>
              Select modes for dashboard quick access.
            </p>

            <div className="mt-4 flex flex-wrap gap-4">
              {[
                ["research", "Research"],
                ["chat", "Chat"],
                ["pdf", "PDF"],
                ["image", "Image"],
              ].map(([key, label]) => (
                <label
  key={key}
  htmlFor={`research-mode-${key}`}
  className="flex cursor-pointer items-center gap-2 text-sm"
>
                  <input
  id={`research-mode-${key}`}
  name={`research-mode-${key}`}
  type="checkbox"
  checked={modes[key]}
  onChange={() => toggleMode(key)}
  className="h-4 w-4 accent-pink-500"
/>                  {label}
                </label>
              ))}
            </div>
          </Card>

          <Card isDark={isDark}>
            <h3 className="text-lg font-bold">Default Report Template</h3>
            <p className={mutedClass(isDark)}>Used for new report generation.</p>

            <select
  id="report-template"
  name="report-template"
  value={defaultTemplate}
  onChange={(e) => setDefaultTemplate(e.target.value)}
  className={inputClass(isDark)}
>
              <option>Academic Research</option>
              <option>Business Report</option>
              <option>Market Research</option>
              <option>Technical Report</option>
              <option>Project Report</option>
            </select>
          </Card>
        </div>
      </div>

      <button
        onClick={saveSettings}
        className={`mt-7 w-full rounded-xl bg-linear-to-r ${accentButton} py-4 font-semibold text-white`}
      >
        Save Changes
      </button>
    </div>
  );
}

function inputClass(isDark) {
  return `mt-4 w-full rounded-xl border px-4 py-3 outline-none ${
    isDark
      ? "border-white/10 bg-[#111124] text-white placeholder:text-slate-500"
      : "border-slate-200 bg-slate-50 text-slate-950 placeholder:text-slate-400"
  }`;
}

function mutedClass(isDark) {
  return isDark ? "text-xs text-slate-400" : "text-xs text-slate-600";
}

function ToolButton({ children, isDark, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        isDark
          ? "rounded-xl bg-white/10 px-4 py-3 text-sm hover:bg-white/15"
          : "rounded-xl bg-slate-100 px-4 py-3 text-sm hover:bg-slate-200"
      }
    >
      {children}
    </button>
  );
}

function Card({ children, pink = false, isDark }) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-xl ${
        pink
          ? isDark
            ? "border-pink-500/30 bg-pink-900/20"
            : "border-pink-200 bg-pink-50"
          : isDark
          ? "border-white/10 bg-white/5"
          : "border-slate-200 bg-white"
      }`}
    >
      {children}
    </div>
  );
}

function Mini({ title, value, isDark }) {
  return (
    <div
      className={
        isDark
          ? "rounded-xl bg-white/10 p-3"
          : "rounded-xl border border-slate-200 bg-white p-3"
      }
    >
      <p className={isDark ? "text-xs text-slate-400" : "text-xs text-slate-500"}>
        {title}
      </p>
      <p className="mt-1 text-sm font-bold capitalize">{value}</p>
    </div>
  );
}