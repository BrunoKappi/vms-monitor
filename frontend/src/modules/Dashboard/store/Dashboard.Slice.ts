import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { DashboardState, CameraUI } from '../types/Dashboard.Types';
import { DashboardService } from '../services/Dashboard.Service';

const applyLayoutOrdering = (cameras: CameraUI[], layout: string): CameraUI[] => {
  const savedOrderJson = localStorage.getItem(`vms_order_${layout}`);
  if (!savedOrderJson) return cameras;
  try {
    const savedIds: string[] = JSON.parse(savedOrderJson);
    return [...cameras].sort((a, b) => {
      const idxA = savedIds.indexOf(a.id);
      const idxB = savedIds.indexOf(b.id);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  } catch (e) {
    console.error('Error parsing layout ordering:', e);
    return cameras;
  }
};

const initialState: DashboardState = {
  cameras: [],
  activeStreams: [],
  isDiscovering: false,
  searchQuery: '',
  gridLayout: (localStorage.getItem('vms_grid_layout') as any) || 'destaque_4x4',
  error: null,
  activeTab: 'live',
};

// Async Thunks
export const fetchStoredCameras = createAsyncThunk(
  'dashboard/fetchStoredCameras',
  async (_, { rejectWithValue }) => {
    try {
      return await DashboardService.fetchStoredCameras();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch cameras.');
    }
  }
);

export const discoverCameras = createAsyncThunk(
  'dashboard/discoverCameras',
  async (_, { rejectWithValue }) => {
    try {
      return await DashboardService.discoverCameras();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Network discovery failed.');
    }
  }
);

export const addCamera = createAsyncThunk(
  'dashboard/addCamera',
  async (
    payload: { ip: string; port: number; user: string; pass: string; name: string },
    { rejectWithValue }
  ) => {
    try {
      return await DashboardService.addCamera(payload);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add camera.');
    }
  }
);

export const deleteCamera = createAsyncThunk(
  'dashboard/deleteCamera',
  async (id: string, { rejectWithValue }) => {
    try {
      await DashboardService.deleteCamera(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete camera.');
    }
  }
);

export const reorderCameras = createAsyncThunk(
  'dashboard/reorderCameras',
  async (ids: string[], { rejectWithValue }) => {
    try {
      return await DashboardService.reorderCameras(ids);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to save camera order.');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setGridLayout: (state, action: PayloadAction<'grid_2x2' | 'grid_3x3' | 'grid_4x4' | 'destaque_3x3' | 'destaque_4x4'>) => {
      state.gridLayout = action.payload;
      localStorage.setItem('vms_grid_layout', action.payload);
      state.cameras = applyLayoutOrdering(state.cameras, action.payload);
    },
    startStream: (state, action: PayloadAction<string>) => {
      if (!state.activeStreams.includes(action.payload)) {
        state.activeStreams.push(action.payload);
      }
    },
    stopStream: (state, action: PayloadAction<string>) => {
      state.activeStreams = state.activeStreams.filter(id => id !== action.payload);
    },
    setTab: (state, action: PayloadAction<'live' | 'manage' | 'resources'>) => {
      state.activeTab = action.payload;
    },
    updateCamerasLocal: (state, action: PayloadAction<CameraUI[]>) => {
      state.cameras = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stored cameras
      .addCase(fetchStoredCameras.fulfilled, (state, action: PayloadAction<CameraUI[]>) => {
        const ordered = applyLayoutOrdering(action.payload, state.gridLayout);
        state.cameras = ordered;
        // Automatically start streams for all online cameras on load!
        state.activeStreams = ordered
          .filter(c => c.status === 'online')
          .map(c => c.id);
        state.error = null;
      })
      .addCase(fetchStoredCameras.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Discover cameras
      .addCase(discoverCameras.pending, (state) => {
        state.isDiscovering = true;
        state.error = null;
      })
      .addCase(discoverCameras.fulfilled, (state, action: PayloadAction<CameraUI[]>) => {
        state.isDiscovering = false;
        const ordered = applyLayoutOrdering(action.payload, state.gridLayout);
        state.cameras = ordered;
        // Automatically start streams for all online discovered cameras!
        state.activeStreams = ordered
          .filter(c => c.status === 'online')
          .map(c => c.id);
      })
      .addCase(discoverCameras.rejected, (state, action) => {
        state.isDiscovering = false;
        state.error = action.payload as string;
      })
      // Add camera
      .addCase(addCamera.fulfilled, (state, action: PayloadAction<CameraUI>) => {
        const index = state.cameras.findIndex(c => c.ip === action.payload.ip);
        if (index >= 0) {
          state.cameras[index] = action.payload;
        } else {
          state.cameras.push(action.payload);
        }
        // Preserve VMS camera ordering after adding a new camera
        state.cameras = applyLayoutOrdering(state.cameras, state.gridLayout);
        // Auto start stream for newly added online camera!
        if (action.payload.status === 'online' && !state.activeStreams.includes(action.payload.id)) {
          state.activeStreams.push(action.payload.id);
        }
        state.error = null;
      })
      .addCase(addCamera.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Delete camera
      .addCase(deleteCamera.fulfilled, (state, action: PayloadAction<string>) => {
        state.cameras = state.cameras.filter(c => c.id !== action.payload);
        state.activeStreams = state.activeStreams.filter(id => id !== action.payload);
        state.error = null;
      })
      .addCase(deleteCamera.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Reorder cameras
      .addCase(reorderCameras.fulfilled, (state, action: PayloadAction<CameraUI[]>) => {
        state.cameras = action.payload;
        state.error = null;
      })
      .addCase(reorderCameras.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setSearchQuery, setGridLayout, startStream, stopStream, setTab, updateCamerasLocal } = dashboardSlice.actions;
export const dashboardReducer = dashboardSlice.reducer;
export const selectDashboard = (state: { dashboard: DashboardState }) => state.dashboard;
export const selectFilteredCameras = (state: { dashboard: DashboardState }) => {
  const { cameras, searchQuery } = state.dashboard;
  const q = searchQuery.toLowerCase().trim();
  if (!q) return cameras;
  return cameras.filter(
    c =>
      c.name.toLowerCase().includes(q) ||
      c.ip.includes(q) ||
      (c.manufacturer && c.manufacturer.toLowerCase().includes(q)) ||
      (c.model && c.model.toLowerCase().includes(q))
  );
};
