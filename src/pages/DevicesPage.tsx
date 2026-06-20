import React, { useState } from "react";
import { useApiGet, useApiDelete, useApiPut } from "../hooks/Apis hooks/useApi";
import { DeviceIcon, HeartRateIcon, ClockIcon, LocationIcon } from "../components/atoms/icons";
import LoadingScreen from "../components/atoms/LoadingScreen";
import ErrorScreen from "../components/atoms/ErrorScreen";
import { useAuth } from "@/context/AuthContext";
import { Trash2, Edit, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

/* ===========================
   TYPE FIX (مهم جدًا)
=========================== */

type ApiDevice = {
  id: number;
  deviceId: string;
  name: string;
  battery: number;
  status: string;
  lat: number;
  long: number;
  googleMapsUrl?: string;
  lastUpdate: string;
  heartRate: number;
  oxygenLevel: number;
  userId: number;

};

/* ===========================
   Device Card
=========================== */

const DeviceCard: React.FC<{ device: ApiDevice; onDelete?: (deviceId: string) => void; isDeleting?: boolean; onUpdate?: (device: ApiDevice) => void; isUpdating?: boolean }> = ({ device, onDelete, isDeleting, onUpdate, isUpdating }) => {
  const isConnected =
    device.status?.toLowerCase() === "online" ||
    device.status?.toLowerCase() === "متصل";

  return (
    <div
      className="
      relative
      bg-white/80 dark:bg-gray-900/40
      backdrop-blur-sm
      border border-gray-200 dark:border-gray-700
      rounded-3xl
      shadow-sm
      hover:shadow-2xl hover:-translate-y-1
      transition-all duration-300
      overflow-hidden
      flex flex-col
    "
    >
      {/* Top Accent Bar */}
      <div
        className={`h-1 w-full ${isConnected ? "bg-emerald-500" : "bg-gray-400"
          }`}
      />

      {(onDelete || onUpdate) && (
        <div className="absolute left-4 top-4 z-10 flex gap-2">
          {onUpdate && (
            <button
              type="button"
              onClick={() => onUpdate && onUpdate(device)}
              disabled={isUpdating}
              className="rounded-full bg-white/95 p-2 text-emerald-600 shadow hover:bg-white disabled:opacity-60"
            >
              <Edit size={16} />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(device.deviceId)}
              disabled={isDeleting}
              className="rounded-full bg-white/95 p-2 text-red-500 shadow hover:bg-white disabled:opacity-60"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}

      <div className="p-7 flex flex-col gap-6 flex-grow">

        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-5 sm:items-center">

          <div className="relative w-24 h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <DeviceIcon className="w-10 h-10 text-emerald-500" />

            {/* Status Dot */}
            <span
              className={`absolute -bottom-2 -right-2 h-5 w-5 rounded-full ring-2 ring-white dark:ring-gray-900
              ${isConnected ? "bg-emerald-500" : "bg-gray-400"}`}
            />
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {device.name}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Device ID: {device.deviceId}
            </p>

            <div className="mt-3">
              <span
                className={`
                  inline-flex items-center px-4 py-1.5
                  text-xs font-semibold rounded-full
                  ${isConnected
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  }
                `}
              >
                {isConnected ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700" />

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <LocationIcon className="h-4 w-4" />
          {device.googleMapsUrl ? (
            <a
              href={device.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-emerald-600 underline dark:text-emerald-400 hover:text-emerald-700"
            >
              Open in Google Maps
            </a>
          ) : (
            <span>
              Location: {device.lat}, {device.long}
            </span>
          )}
        </div>

        {/* Battery */}
        <div>
          <div className="flex justify-between text-xs mb-1 text-gray-500">
            <span>Battery</span>
            <span>{device.battery}%</span>
          </div>

          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div
              className="h-2 bg-emerald-500 rounded-full"
              style={{ width: `${device.battery}%` }}
            />
          </div>
        </div>

        {/* Heart Rate */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <HeartRateIcon className="h-4 w-4" />
            Heart Rate
          </div>

          <span>
            {device.heartRate} bpm
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <h2>O<span className="text-sm">2</span></h2>
            Oxygen Level
          </div>

          <span>
            {device.oxygenLevel}%
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4" />
            Last Update
          </div>

          <span>
            {new Date(device.lastUpdate).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ===========================
   Devices Page
=========================== */

const DevicesPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showEditDeviceModal, setShowEditDeviceModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<{ id?: number; name?: string; battery?: number ;deviceId?: string }>({});

  const { data, isLoading, isError, error, refetch } = useApiGet(
    "/Devices/GETDevices",
    {},
    ["devices", user?.id], !!user
  );

  const { mutate: deleteDevice, isPending: isDeletingDevice } = useApiDelete(["devices", user?.id]);
  const { mutate: updateDevice, isPending: isUpdatingDevice } = useApiPut(["devices", user?.id]);

  const handleDeleteDevice = (id: number) => {
    deleteDevice(
      {
        path: `/Devices/${id}`,
        data: {},
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["devices", user?.id] });
          refetch();
        },
        onError: (err) => {
          console.error("Delete device error", err);
        },
      }
    );
  };

  const devices: ApiDevice[] = data?.data ?? [];

  const openEditDevice = (device: ApiDevice) => {
    setEditingDevice({ id: device.id, name: device.name, battery: device.battery, deviceId: device.deviceId });
    setShowEditDeviceModal(true);
  };

  const closeEditDeviceModal = () => {
    setShowEditDeviceModal(false);
    setEditingDevice({});
  };

  const handleConfirmUpdateDevice = () => {
    if (!editingDevice?.id || !editingDevice?.name?.trim()) return;

    updateDevice(
      {
        path: `/Devices/update-Band-ForWeb${editingDevice.id}`,
        data: {
          name: editingDevice.name.trim(),
          battery: editingDevice.battery,
          deviceId: editingDevice.deviceId,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["devices", user?.id] });
          refetch();
          closeEditDeviceModal();
        },
        onError: (err) => console.error("Update device error", err),
      }
    );
  };

  if (isLoading) return <LoadingScreen />;
  if (isError)
    return (
      <ErrorScreen
        statusCode={(error as any)?.status}
      />
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-6 md:p-10">

      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex items-center gap-3">
          <DeviceIcon className="w-8 h-8 text-emerald-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Devices
          </h1>
        </div>

        {/* Grid */}
        {devices.length > 0 ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {devices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onDelete={() => handleDeleteDevice(device.id)}
                isDeleting={isDeletingDevice}
                onUpdate={openEditDevice}
                isUpdating={isUpdatingDevice}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            No devices found
          </div>
        )}
      </div>

      {showEditDeviceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-2xl p-6 bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
            <button
              type="button"
              onClick={closeEditDeviceModal}
              className="absolute left-4 top-4 rounded-full bg-white/90 p-2 text-gray-700 dark:text-gray-200 hover:bg-white"
            >
              <X size={20} />
            </button>

            <h2 className="mb-4 text-xl font-bold">Edit Device Name</h2>

            <input
              value={editingDevice.name || ""}
              onChange={(e) => setEditingDevice({ ...editingDevice, name: e.target.value })}
              placeholder="Device name"
              className="mb-4 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleConfirmUpdateDevice}
                disabled={isUpdatingDevice || !editingDevice?.name?.trim()}
                className="flex-1 rounded-xl bg-emerald-500 py-3 text-white disabled:opacity-60"
              >
                {isUpdatingDevice ? "Saving..." : "Confirm"}
              </button>

              <button
                type="button"
                onClick={closeEditDeviceModal}
                className="flex-1 rounded-xl border border-gray-300 bg-white py-3 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevicesPage;
