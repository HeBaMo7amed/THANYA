import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, ClipboardList, Activity, X, Trash2, Phone, Edit } from "lucide-react";
import { useApiGet, useApiPut, useApiPost, useApiDelete } from "../../hooks/Apis hooks/useApi";
import LoadingScreen from "../atoms/LoadingScreen";
import ErrorScreen from "../atoms/ErrorScreen";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { LuGalleryHorizontal } from "react-icons/lu";
import { ClockIcon, HeartRateIcon, LocationIcon } from "../atoms/icons";



const PatientDashboard = () => {
  const { user: userd } = useAuth();

  /* ================= DASHBOARD ================= */
  const queryClient = useQueryClient();
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useApiGet(
    "/Dashboard/user",
    {},
    ["dashboardUser", userd?.id], (!!userd && userd?.role === 'User')
  );
  /* ================= Emergency user ================= */
  const {
    data: emergencyUserData,
  } = useApiGet(
    "/Dashboard/emergency-record",
    { token: sessionStorage.getItem('targetUserId') || undefined },
    ["emergencyRecord", userd?.id], (!!userd && userd?.role === 'Paramedic')
  );
  /* ================= USER ================= */

  const {
    data: userData,
  } = useApiGet(
    "/Account/me",
    {},
    ["me", userd?.id], (!!userd && userd?.role === 'User')
  );

  /* ================= MEDICAL ================= */

  // const {
  //   data: medicalData,
  // } = useApiGet(
  //   "/Account/Show medical",
  //   {},
  //   ["medical"]
  // );

  /* ================= UPDATE ================= */

  const {
    mutate: updateMedical,
    isPending,
  } = useApiPut(["medical"]);


  /* ================= DATA ================= */

  // IMPORTANT:
  // API returns direct object
  // NOT { data: {} }

  const dashboard = data || {};

  const user = userData || {};
  const emergencyUser = emergencyUserData || {};

  const medicalRecord =

    dashboard?.medicalRecord ||
    {};

  /* ================= STATES ================= */

  const [dark, setDark] =
    useState(false);

  const [
    showEditModal,
    setShowEditModal,
  ] = useState(false);

  const [editData, setEditData] =
    useState({
      bloodType: "",
      chronicDiseases: "",
      allergies: "",
      currentMedication: "",
      weight: "",
      summery: "",
    });

  const addFileInputRef = useRef<HTMLInputElement | null>(null);
  const [expandedImage, setExpandedImage] = useState<any>(null);
  const [fileError, setFileError] = useState("");

  const { mutate: addImages, isPending: isUpdatingImages } = useApiPost(["me", userd?.id]);

  const createFormData = (newFile?: File) => {
    const formData = new FormData();

    if (newFile) {
      formData.append("Images", newFile);
    }
    return formData;
  };

  const handleAddImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFileError("");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      setFileError("Only images or PDF files are allowed");
      return;
    }

    setFileError("");

    addImages(
      {
        path: "/Account/medical/add-images",
        data: createFormData(file),
      },
      {
        onSuccess: () => {
          if (addFileInputRef.current) {
            addFileInputRef.current.value = "";
          }
          setFileError("");
        },
        onError: (err) => {
          console.error("Add image error", err);
        },
      }
    );
  };
  const { mutate: deleteImage, isPending: isDeletingImages } = useApiDelete(["me", userd?.id]);

  const { mutate: updateDevice, isPending: isUpdatingDevice } = useApiPut(["devices", userd?.id]);

  const { mutate: updateEmergencyContact, isPending: isUpdatingContact } = useApiPut(["emergencyContacts"]);
  const { mutate: deleteEmergencyContact, isPending: isDeletingContact } = useApiDelete(["emergencyContacts"]);
  const { mutate: addEmergencyContact, isPending: isAddingContact } = useApiPost(["emergencyContacts"]);

  const { mutate: deleteDevice, isPending: isDeletingDevice } = useApiDelete(["dashboardUser", userd?.id]);

  const handleDeleteDevice = (deviceId: number) => {
    console.log("DELETE ID:", deviceId);

    deleteDevice(
      {
        path: `/Devices/${deviceId}`,
        data: {},
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["dashboardUser", userd?.id] });
          refetch();
        },
        onError: (err) => {
          console.error("Delete device error", err);
        },
      }
    );
  };

  const [showEditDeviceModal, setShowEditDeviceModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<{ id?: number; name?: string; battery?: number }>({});

  const openEditDevice = (device: any) => {
    setEditingDevice({ id: device.id, name: device.name, battery: device.battery });
    setShowEditDeviceModal(true);
  };

  const handleConfirmUpdateDevice = () => {
    console.log('editingDevice', editingDevice)
    if (!editingDevice?.id) return;
    updateDevice(
      {
        path: `/Devices/update-Band-ForWeb${editingDevice.id}`,
        data: {
          name: editingDevice.name,
          battery: editingDevice.battery,
          deviceId: String(editingDevice.id),
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["dashboardUser", userd?.id] });
          refetch();
          setShowEditDeviceModal(false);
        },
        onError: (err) => console.error("Update device error", err),
      }
    );
  };

  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<any>({ emergencyId: null, name: "", phone: "" });
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "" });
  const [phoneError, setPhoneError] = useState("");

  const openEditContact = (contact: any) => {
    setEditingContact({ emergencyId: contact.emergencyId, name: contact.name || "", phone: contact.phone || "" });
    setPhoneError("");
    setShowEditContactModal(true);
  };

  const openAddContact = () => {
    setNewContact({ name: "", phone: "" });
    setPhoneError("");
    setShowAddContactModal(true);
  };

  const validatePhone = (phone: string) => {
    const cleanValue = phone.replace(/\D/g, "");
    if (!cleanValue) {
      return "Phone number is required";
    }
    if (cleanValue.length < 7 || cleanValue.length > 15) {
      return "Phone number must contain only digits (7–15 characters)";
    }
    return "";
  };

  const handleConfirmUpdateContact = () => {
    const phone = editingContact.phone?.toString() || "";
    const error = validatePhone(phone);
    if (error) {
      setPhoneError(error);
      return;
    }
    if (!editingContact?.emergencyId) return;

    updateEmergencyContact(
      {
        path: `/EmergencyContacts/update/${editingContact.emergencyId}`,
        data: {
          name: editingContact.name,
          phone: phone.trim(),
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["dashboardUser", userd?.id] });
          refetch();
          setShowEditContactModal(false);
          setPhoneError("");
        },
        onError: (err) => {
          console.error("Update contact error", err);
        },
      }
    );
  };

  const handleDeleteContact = (emergencyId: any) => {
    deleteEmergencyContact(
      {
        path: `/EmergencyContacts/delete/${emergencyId}`,
        data: {},
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["dashboardUser", userd?.id] });
          refetch();
        },
        onError: (err) => {
          console.error("Delete contact error", err);
        },
      }
    );
  };

  const handleCreateEmergencyContact = () => {
    const phone = newContact.phone?.toString() || "";
    const error = validatePhone(phone);
    if (error) {
      setPhoneError(error);
      return;
    }

    if (!newContact.name.trim() || !phone.trim()) return;

    addEmergencyContact(
      {
        path: "/EmergencyContacts/add",
        data: {
          name: newContact.name.trim(),
          phone: phone.trim(),
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["dashboardUser", userd?.id] });
          refetch();
          setShowAddContactModal(false);
          setNewContact({ name: "", phone: "" });
          setPhoneError("");
        },
        onError: (err) => {
          console.error("Create emergency contact error", err);
        },
      }
    );
  };

  const handleDeleteImage = (imageId: number) => {
    deleteImage(
      {
        path: `/Account/medical/delete-image/${imageId}`,
        data: {},
      },
      {
        onSuccess: () => {
          // successful deletion will invalidate the query via useApiDelete
        },
        onError: (err) => {
          console.error("Delete image error", err);
        },
      }
    );
  };

  // Open images in modal, download PDFs instead
  const handleFileOpenOrDownload = (file: any) => {
    const url = file?.url || "";
    const isPdf = url.toLowerCase().endsWith(".pdf") || file?.mimeType === "application/pdf";

    if (isPdf) {
      try {
        const a = document.createElement("a");
        a.href = url;
        // attempt to infer filename
        a.download = file?.url
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (err) {
        // fallback: open in new tab
        window.open(url, "_blank");
      }
    } else {
      setExpandedImage(file);
    }
  };


  /* ================= THEME ================= */

  useEffect(() => {

    const checkTheme = () => {
      setDark(
        document.documentElement.classList.contains(
          "dark"
        )
      );
    };

    checkTheme();

    const observer =
      new MutationObserver(checkTheme);

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: ["class"],
      }
    );

    return () => observer.disconnect();

  }, []);
  const cleanValue = (value: string) => {
    return value.trim() === "" ? "-" : value;
  };
  /* ================= UPDATE ================= */
  const handleUpdate = () => {

    updateMedical(
      {
        path: "/Account/medical/update",

        data: {
          bloodType: editData.bloodType || null,

          chronicDiseases: cleanValue(
            editData.chronicDiseases
          ),

          allergies: cleanValue(
            editData.allergies
          ),

          currentMedication: cleanValue(
            editData.currentMedication
          ),

          weight: cleanValue(editData.weight),

          summery: cleanValue(editData.summery),
        },
      },

      {
        onSuccess: () => {

          queryClient.invalidateQueries({
            queryKey: ["dashboardUser", userd?.id],
          });

          refetch();

          setShowEditModal(false);
        },

        onError: (err) => {
          console.log(err);
        },
      }
    );
  };
  /* ================= LOADING ================= */

  if (isLoading) {

    return (
      <LoadingScreen
        message="Loading Dashboard..."
      />
    );
  }

  /* ================= ERROR ================= */

  if (isError) {

    return (
      <ErrorScreen
        statusCode={(error as any)?.status}
      />
    );
  }
  const devices =
    userd?.role === "Paramedic"
      ? emergencyUser?.devices || []
      : dashboard?.devices || [];

  const emergencyContacts =
    userd?.role === "Paramedic"
      ? emergencyUser?.emergencyContacts || []
      : dashboard?.emergencyContacts || [];
  return (

    <main className="relative min-h-screen overflow-hidden bg-gradient-to-r from-emerald-50 to-white px-6 py-6 dark:from-gray-900 dark:to-gray-950">

      {/* GLOW */}

      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-emerald-200/20 blur-3xl animate-pulse" />

      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl animate-pulse" />

      <input
        ref={addFileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx"
        className="hidden"
        onChange={handleAddImage}
      />

      {/* CONTENT */}

      <div className="relative z-10 space-y-8">

        {/* HEADER */}

        <header className="flex items-center gap-4">

          <div className="rounded-2xl bg-emerald-500/10 p-3">

            <User
              className={
                dark
                  ? "text-emerald-300"
                  : "text-emerald-600"
              }
            />

          </div>

          <div>

            <h1
              className={`text-2xl font-bold ${dark
                ? "text-white"
                : "text-gray-900"
                }`}
            >
              {user?.name || emergencyUser?.fullName || "Patient Dashboard"}
            </h1>
            {userd?.role !== 'Paramedic' &&
              <p
                className={`text-sm ${dark
                  ? "text-gray-300"
                  : "text-gray-600"
                  }`}
              >
                {user?.email}
              </p>
            }
            {userd?.role === 'Paramedic' &&
              <p
                className={`text-sm ${dark
                  ? "text-gray-300"
                  : "text-gray-600"
                  }`}
              >
                {emergencyUser?.gender}
              </p>
            }
            <p
              className={`text-xsm ${dark
                ? "text-gray-300"
                : "text-gray-600"
                }`}
            >
              Years Old {user?.age || emergencyUser?.age || "غير محدد"}
            </p>
          </div>

        </header>

        {/* EMERGENCY CONTACTS */}
        <section
          className={`rounded-2xl border p-5 backdrop-blur ${dark
            ? "border-gray-700 bg-gray-800/60 text-white"
            : "border-gray-200 bg-white/70 text-gray-900"
            }`}
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 font-bold">
              <Phone />
              Emergency Contacts
            </h2>
            {userd?.role === 'User' && (
              <button
                type="button"
                onClick={openAddContact}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
              >
                Add Emergency Contact
              </button>
            )}
          </div>
          {emergencyContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-300 bg-white/70 p-10 text-center dark:border-gray-600 dark:bg-gray-900/50">
              <p className="text-sm text-gray-500 dark:text-gray-300">No emergency contacts added.</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {emergencyContacts.map(
                (contact: any, index: number) => (
                  <div
                    key={index}
                    className={`relative rounded-xl border p-4 ${dark
                      ? "border-gray-700 bg-gray-900/40"
                      : "border-gray-200 bg-gray-50"
                      }`}
                  >
                    <p className="font-semibold">{contact.name}</p>
                    <p className="text-sm opacity-70">{contact.phone}</p>
                    {userd?.role === 'User' && (
                      <div className="absolute left-3 bottom-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditContact(contact)}
                          className="rounded-full bg-white/95 p-2 text-emerald-600 shadow hover:bg-white"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteContact(contact.emergencyId)}
                          disabled={isDeletingContact}
                          className="rounded-full bg-white/95 p-2 text-red-500 shadow hover:bg-white disabled:opacity-60"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </section>


        {/* STATS */}
        {userd?.role !== 'Paramedic' &&
          <div className="grid grid-cols-3 gap-4">

            <Stat
              label="Total"
              value={
                dashboard?.totalDevices || 0
              }
              dark={dark}
            />

            <Stat
              label="Online"
              value={
                dashboard?.onlineDevices || 0
              }
              dark={dark}
              green
            />

            <Stat
              label="Offline"
              value={
                dashboard?.offlineDevices || 0
              }
              dark={dark}
              red
            />

          </div>
        }
        {/* GRID */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* MEDICAL */}

          <section
            className={`rounded-2xl border p-5 backdrop-blur ${dark
              ? "border-gray-700 bg-gray-800/60 text-white"
              : "border-gray-200 bg-white/70 text-gray-900"
              } lg:col-span-2 
             `}
          >

            <div className="mb-4 flex items-center justify-between">

              <h2 className="flex items-center gap-2 font-bold">

                <ClipboardList />

                Medical Record

              </h2>
              {userd?.role === 'User' &&
                <button
                  onClick={() => {
                    setEditData({
                      bloodType: medicalRecord?.bloodType || "",
                      chronicDiseases: medicalRecord?.chronicDiseases || "",
                      allergies: medicalRecord?.allergies || "",
                      currentMedication: medicalRecord?.currentMedication || "",
                      weight: medicalRecord?.weight || "",
                      summery: medicalRecord?.summery || "",
                    });

                    setShowEditModal(true);
                  }}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-white"
                >
                  Update
                </button>
              }
            </div>
            <div className="mb-4 w-full">
              <Card
                label="Summary"
                value={
                  medicalRecord?.summery || emergencyUser?.summery || "No summary available."
                }
                dark={dark}
              /></div>
            <div className="grid gap-4 sm:grid-cols-2">

              <Card
                label="Blood Type"
                value={
                  medicalRecord?.bloodType || emergencyUser?.bloodType || "Not specified"
                }
                dark={dark}
              />

              <Card
                label="Chronic Diseases"
                value={
                  medicalRecord?.chronicDiseases || emergencyUser?.chronicDiseases || "Not specified"
                }
                dark={dark}
              />

              <Card
                label="Allergies"
                value={
                  medicalRecord?.allergies || emergencyUser?.allergies || "Not specified"
                }
                dark={dark}
              />

              <Card
                label="Medication"
                value={
                  medicalRecord?.currentMedication || emergencyUser?.currentMedication || "Not specified"
                }
                dark={dark}
              />
              <Card
                label="Weight"
                value={
                  medicalRecord?.weight || emergencyUser?.weight || "Not specified"
                }
                dark={dark}
              />
            </div>

          </section>

          {/* DEVICES */}
          <section
            className={`rounded-2xl border p-5 backdrop-blur ${dark
              ? "border-gray-700 bg-gray-800/60 text-white"
              : "border-gray-200 bg-white/70 text-gray-900"
              }`}
          >

            <h2 className="mb-4 flex items-center gap-2 font-bold">

              <Activity />

              Devices

            </h2>

            <div className="space-y-4">

              {devices.map(
                (d: any) => {

                  const isOnline =
                    d?.status?.toLowerCase() ===
                    "online";

                  return (

                    <div
                      key={d.deviceId}
                      className={`relative rounded-xl border p-4 ${dark
                        ? "border-gray-700 bg-gray-900/40"
                        : "border-gray-200 bg-gray-50"
                        }`}
                    >

                      <p className="font-bold">
                        {d.name}
                      </p>

                      <p className="text-xs opacity-70">
                        ID: {d.deviceId}
                      </p>
                      {userd?.role === 'User' && (
                        <div className="absolute left-3 top-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditDevice(d)}
                            disabled={isUpdatingDevice}
                            className="rounded-full bg-white/95 p-2 text-emerald-600 shadow hover:bg-white disabled:opacity-60"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteDevice(d.id)}

                            disabled={isDeletingDevice}
                            className="rounded-full bg-white/95 p-2 text-red-500 shadow hover:bg-white disabled:opacity-60"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}

                      <p className="mt-1 text-sm">

                        Status:

                        <span
                          className={`ml-1 ${isOnline
                            ? "text-green-400"
                            : "text-red-400"
                            }`}
                        >
                          {d.status}
                        </span>

                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <LocationIcon className="h-4 w-4" />
                        {d.googleMapUrl ? (
                          <a
                            href={d.googleMapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-emerald-600 underline dark:text-emerald-400 hover:text-emerald-700"
                          >
                            Open in Google Maps
                          </a>
                        ) : (
                          <span>
                            Location: {d.lat}, {d.long}
                          </span>
                        )}
                      </div>

                      {/* BATTERY */}

                      <div className="mt-3">

                        <div className="mb-1 flex justify-between text-xs">

                          <span>
                            Battery
                          </span>

                          <span>
                            {d.battery}%
                          </span>

                        </div>

                        <div className="h-2 w-full rounded-full bg-gray-300 mb-2">

                          <div
                            className="h-2 rounded-full bg-emerald-500"
                            style={{
                              width: `${d.battery}%`,
                            }}
                          />

                        </div>

                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 ">
                        <div className="flex items-center gap-2">
                          <HeartRateIcon className="h-4 w-4" />
                          Heart Rate
                        </div>

                        <span>
                          {d.heartRate} bpm
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <h2>O<span className="text-sm">2</span></h2>
                          Oxygen Level
                        </div>

                        <span>
                          {d.oxygenLevel}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4" />
                          Last Update
                        </div>

                        <span>
                          {new Date(d.lastUpdate).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                }
              )}

            </div>

          </section>

          {/* ATTACHMENT */}
          <section
            className={`lg:col-span-3 rounded-2xl border p-5 backdrop-blur ${dark
              ? "border-gray-700 bg-gray-800/60 text-white"
              : "border-gray-200 bg-white/70 text-gray-900"
              }`}
          >
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold">Attachment</h2>
              {userd?.role === 'User' &&
                <button
                  type="button"
                  onClick={() => addFileInputRef.current?.click()}
                  disabled={isUpdatingImages}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-white disabled:opacity-60"
                >
                  {isUpdatingImages ? "Adding..." : "Add"}
                </button>
              }
            </div>
            {fileError && (
              <p className="text-sm text-red-500 mb-4">{fileError}</p>
            )}
            <div className="space-y-4">
              {(user?.medicalRecord?.image || emergencyUser?.images || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/70 p-10 text-center dark:border-gray-600 dark:bg-gray-900/50">
                  <p className="text-sm text-gray-500 dark:text-gray-300">No attachments yet. Upload image or PDF only.</p>
                  {userd?.role === 'User' &&
                    <button
                      type="button"
                      onClick={() => addFileInputRef.current?.click()}
                      disabled={isUpdatingImages}
                      className="mt-4 rounded-xl bg-emerald-500 px-4 py-2 text-white disabled:opacity-60"
                    >
                      {isUpdatingImages ? "Adding..." : "Add"}
                    </button>
                  }
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                  {(user?.medicalRecord?.image || emergencyUser?.images || []).map((file: any, idx: number) => {
                    const url = file?.url || "";
                    const isPdf = url.toLowerCase().endsWith(".pdf") || file?.mimeType === "application/pdf";

                    return (
                      <div
                        key={file.id || file.url || idx}
                        className={`group relative flex h-72 overflow-hidden rounded-2xl border-2 border-gray-300 bg-gray-100 transition-all hover:border-emerald-400 dark:border-gray-600 dark:bg-gray-900 cursor-pointer`}
                        onClick={() => handleFileOpenOrDownload(file)}
                      >
                        {userd?.role === 'User' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage(file.id);
                            }}
                            disabled={isDeletingImages}
                            className="absolute left-3 bottom-3 z-10 flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-red-500 shadow-lg hover:bg-white disabled:opacity-60"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        )}

                        {isPdf ? (
                          <div className="flex w-full flex-col items-center justify-center p-6">
                            {/* <div className="mb-4 flex items-center justify-center rounded-full bg-emerald-50 p-4 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
                              <LuGalleryHorizontal className="h-10 w-10" />
                            </div> */}

                            <p className="mt-1 max-w-full truncate text-center text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                              {file.fileName || file.name || url.split('/').pop()}

                            </p>

                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Click to open
                            </p>
                          </div>
                        ) : (
                          <div className="flex-1 overflow-hidden">
                            <img
                              src={file.url}
                              alt={`attachment-${file.id}`}
                              className="h-full w-full object-cover transition-transform group-hover:scale-110"
                            />
                          </div>
                        )}

                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                          <div className="text-white opacity-0 transition-opacity group-hover:opacity-100">
                            {isPdf ? "Click to download" : "Click to expand"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* IMAGE EXPANSION MODAL */}
          {expandedImage && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
              onClick={() => setExpandedImage(null)}
            >
              <div
                className="relative w-full max-w-3xl rounded-2xl overflow-hidden"
                style={{ maxHeight: '90vh' }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setExpandedImage(null)}
                  className="absolute z-[100] left-4 top-4 rounded-full bg-white p-2 text-gray-900 hover:bg-gray-200"
                >
                  <X size={24} />
                </button>
                <img
                  src={expandedImage.url}
                  alt="expanded"
                  className="block w-full h-auto object-contain"
                  style={{ maxHeight: '90vh' }}
                />
              </div>
            </div>
          )}

          {showEditDeviceModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className={`relative w-full max-w-md rounded-2xl p-6 ${dark ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
                <button onClick={() => setShowEditDeviceModal(false)} className="absolute left-4 top-4">
                  <X />
                </button>
                <h2 className="mb-4 font-bold">Edit Device Name</h2>
                <input
                  value={editingDevice.name || ""}
                  onChange={(e) => setEditingDevice({ ...editingDevice, name: e.target.value })}
                  placeholder="Device name"
                  className={`mb-4 w-full rounded-xl border p-3 ${dark ? "border-gray-700 bg-gray-900 text-white" : "border-gray-300 bg-white text-black"}`}
                />
                <div className="flex gap-3">
                  <button type="button" onClick={handleConfirmUpdateDevice} disabled={isUpdatingDevice} className="flex-1 rounded-xl bg-emerald-500 py-3 text-white disabled:opacity-60">
                    {isUpdatingDevice ? "Saving..." : "Confirm"}
                  </button>
                  <button type="button" onClick={() => setShowEditDeviceModal(false)} className="flex-1 rounded-xl border py-3">Cancel</button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL */}

        {showEditModal && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div
              className={`relative w-full max-w-md rounded-2xl p-6 ${dark
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-900"
                }`}
            >

              {/* CLOSE */}

              <button
                onClick={() =>
                  setShowEditModal(false)
                }
                className="absolute left-4 top-4"
              >
                <X />
              </button>

              <h2 className="mb-4 font-bold">

                Edit Medical Record

              </h2>

              {/* INPUTS */}

              <select
                value={editData.bloodType}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    bloodType: e.target.value,
                  })
                }
                className={`mb-3 w-full rounded-xl border p-3 ${dark
                  ? "border-gray-700 bg-gray-900 text-white"
                  : "border-gray-300 bg-white text-black"
                  }`}
              >
                <option value="" disabled>
                  Select Blood Type
                </option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>

              <input
                value={
                  editData.chronicDiseases
                }
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    chronicDiseases:
                      e.target.value,
                  })
                }
                placeholder="الأمراض المزمنة"
                className={`mb-3 w-full rounded-xl border p-3 ${dark
                  ? "border-gray-700 bg-gray-900 text-white"
                  : "border-gray-300 bg-white text-black"
                  }`}
              />

              <input
                value={editData.allergies}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    allergies:
                      e.target.value,
                  })
                }
                placeholder="الحساسية"
                className={`mb-3 w-full rounded-xl border p-3 ${dark
                  ? "border-gray-700 bg-gray-900 text-white"
                  : "border-gray-300 bg-white text-black"
                  }`}
              />

              <input
                value={
                  editData.currentMedication
                }
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    currentMedication:
                      e.target.value,
                  })
                }
                placeholder="الأدوية الحالية"
                className={`mb-4 w-full rounded-xl border p-3 ${dark
                  ? "border-gray-700 bg-gray-900 text-white"
                  : "border-gray-300 bg-white text-black"
                  }`}
              />
              <input
                value={editData.weight}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    weight: e.target.value,
                  })
                }
                placeholder="الوزن"
                className={`mb-4 w-full rounded-xl border p-3 ${dark
                  ? "border-gray-700 bg-gray-900 text-white"
                  : "border-gray-300 bg-white text-black"
                  }`}
              />
              < textarea
                value={editData.summery}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    summery: e.target.value,
                  })
                }
                placeholder="ملخص الحالة الصحية"
                className={`mb-4 w-full rounded-xl border p-3 ${dark
                  ? "border-gray-700 bg-gray-900 text-white"
                  : "border-gray-300 bg-white text-black"
                  }`}
              />

              {/* SAVE */}

              <button
                type="button"
                onClick={handleUpdate}
                className="w-full rounded-xl bg-emerald-500 py-3 text-white"
              >
                {isPending
                  ? "Saving..."
                  : "Save"}
              </button>

            </div>

          </div>

        )}

        {showEditContactModal && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div
              className={`relative w-full max-w-md rounded-2xl p-6 ${dark
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-900"
                }`}
            >

              <button
                onClick={() => setShowEditContactModal(false)}
                className="absolute right-4 top-4"
              >
                <X />
              </button>

              <h2 className="mb-4 font-bold">Edit Emergency Contact</h2>

              <input
                value={editingContact.name}
                onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                placeholder="Name"
                className={`mb-3 w-full rounded-xl border p-3 ${dark
                  ? "border-gray-700 bg-gray-900 text-white"
                  : "border-gray-300 bg-white text-black"
                  }`}
              />

              <input
                value={editingContact.phone}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, "");
                  setEditingContact({ ...editingContact, phone: digitsOnly });
                  setPhoneError(validatePhone(digitsOnly));
                }}
                placeholder="Phone"
                className={`mb-2 w-full rounded-xl border p-3 ${dark
                  ? "border-gray-700 bg-gray-900 text-white"
                  : "border-gray-300 bg-white text-black"
                  }`}
              />
              {phoneError ? (
                <p className="mb-4 text-sm text-rose-500">{phoneError}</p>
              ) : null}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleConfirmUpdateContact}
                  disabled={isUpdatingContact || !editingContact.name.trim() || !editingContact.phone.trim() || !!phoneError}
                  className="flex-1 rounded-xl bg-emerald-500 py-3 text-white disabled:opacity-60"
                >
                  {isUpdatingContact ? "Saving..." : "Confirm"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowEditContactModal(false)}
                  className="flex-1 rounded-xl border py-3"
                >
                  Cancel
                </button>
              </div>

            </div>

          </div>

        )}

        {showAddContactModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className={`relative w-full max-w-md rounded-2xl p-6 ${dark ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
              <button
                onClick={() => setShowAddContactModal(false)}
                className="absolute left-4 top-4"
              >
                <X />
              </button>

              <h2 className="mb-4 font-bold">Create Emergency Contact</h2>

              <input
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="Name"
                className={`mb-3 w-full rounded-xl border p-3 ${dark ? "border-gray-700 bg-gray-900 text-white" : "border-gray-300 bg-white text-black"}`}
              />

              <input
                value={newContact.phone}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, "");
                  setNewContact({ ...newContact, phone: digitsOnly });
                  setPhoneError(validatePhone(digitsOnly));
                }}
                placeholder="Phone"
                className={`mb-2 w-full rounded-xl border p-3 ${dark ? "border-gray-700 bg-gray-900 text-white" : "border-gray-300 bg-white text-black"}`}
              />
              {phoneError ? (
                <p className="mb-4 text-sm text-rose-500">{phoneError}</p>
              ) : null}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCreateEmergencyContact}
                  disabled={isAddingContact || !newContact.name.trim() || !newContact.phone.trim() || !!phoneError}
                  className="flex-1 rounded-xl bg-emerald-500 py-3 text-white disabled:opacity-60"
                >
                  {isAddingContact ? "Saving..." : "Confirm"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="flex-1 rounded-xl border py-3"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {expandedImage && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
            onClick={() => setExpandedImage(null)}
          >
            <div
              className="relative w-full max-w-3xl rounded-2xl overflow-hidden"
              style={{ maxHeight: "90vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedImage(null);
                }}
                className="absolute left-4 top-4 z-[10000] rounded-full bg-white p-2 text-gray-900 hover:bg-gray-200"
              >
                <X size={24} />
              </button>

              <img
                src={expandedImage.url}
                alt="expanded"
                className="block w-full h-auto object-contain"
                style={{ maxHeight: "90vh" }}
              />
            </div>
          </div>
        )}

      </div>

    </main>
  );
};

/* ================= STAT ================= */

const Stat = ({
  label,
  value,
  dark,
  green,
  red,
}: any) => (

  <div
    className={`rounded-xl border p-4 text-center ${dark
      ? "border-gray-700 bg-gray-800/40 text-white"
      : "bg-white"
      }`}
  >

    <p className="text-xs opacity-70">
      {label}
    </p>

    <p
      className={`text-xl font-bold ${green
        ? "text-green-400"
        : red
          ? "text-red-400"
          : ""
        }`}
    >
      {value}
    </p>

  </div>
);

/* ================= CARD ================= */

const Card = ({
  label,
  value,
  dark,
}: any) => (

  <div
    className={`rounded-xl border p-4 ${dark
      ? "border-gray-700 bg-gray-900/40 text-white"
      : "bg-gray-50 text-gray-900"
      }`}
  >

    <p className="text-xs opacity-70">
      {label}
    </p>

    <p className="font-bold whitespace-pre-wrap break-words text-sm">
      {value || "-"}
    </p>

  </div>
);

export default PatientDashboard;