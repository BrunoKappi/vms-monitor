import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store';
import type { CameraUI } from '../types/Dashboard.Types';
import {
  fetchStoredCameras,
  discoverCameras,
  addCamera,
  deleteCamera,
  reorderCameras,
  setSearchQuery,
  setGridLayout,
  startStream,
  stopStream,
  setTab,
  updateCamerasLocal,
  selectFilteredCameras
} from '../store/Dashboard.Slice';

export const useDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { cameras, activeStreams, isDiscovering, searchQuery, gridLayout, error, activeTab } = useSelector(
    (state: RootState) => state.dashboard
  );

  const filteredCameras = useSelector((state: RootState) => selectFilteredCameras(state));

  // Automatically load saved cameras on startup
  useEffect(() => {
    dispatch(fetchStoredCameras());
  }, [dispatch]);

  const handleDiscover = () => {
    dispatch(discoverCameras());
  };

  const handleAddCamera = (payload: {
    ip: string;
    port: number;
    user: string;
    pass: string;
    name: string;
  }) => {
    return dispatch(addCamera(payload)).unwrap();
  };

  const handleDeleteCamera = (id: string) => {
    dispatch(deleteCamera(id));
  };

  const handleSearch = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  const handleSetGridLayout = (layout: 'grid_2x2' | 'grid_3x3' | 'grid_4x4' | 'destaque_3x3' | 'destaque_4x4') => {
    dispatch(setGridLayout(layout));
  };

  const handleStartStream = (cameraId: string) => {
    dispatch(startStream(cameraId));
  };

  const handleStopStream = (cameraId: string) => {
    dispatch(stopStream(cameraId));
  };

  const handleSetTab = (tab: 'live' | 'manage') => {
    dispatch(setTab(tab));
  };

  const handleReorderCameras = (reorderedCameras: CameraUI[]) => {
    // 1. Immediately update local state for ultra-snappy responsiveness
    dispatch(updateCamerasLocal(reorderedCameras));
    
    // 2. Persist the new sequence in the backend database
    const ids = reorderedCameras.map(c => c.id);
    dispatch(reorderCameras(ids));
  };

  return {
    cameras,
    filteredCameras,
    activeStreams,
    isDiscovering,
    searchQuery,
    gridLayout,
    error,
    activeTab,
    handleDiscover,
    handleAddCamera,
    handleDeleteCamera,
    handleSearch,
    handleSetGridLayout,
    handleStartStream,
    handleStopStream,
    handleSetTab,
    handleReorderCameras
  };
};
