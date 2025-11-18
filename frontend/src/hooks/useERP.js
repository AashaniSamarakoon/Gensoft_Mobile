import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchIOUsAsync,
  createIOUAsync,
  updateIOUAsync,
  deleteIOUAsync,
  fetchProofsAsync,
  createProofAsync,
  fetchSettlementsAsync,
  createSettlementAsync,
  fetchApprovalsAsync,
  approveItemAsync,
  rejectItemAsync,
  fetchDashboardStatsAsync,
  selectIOUs,
  selectIOUsLoading,
  selectIOUsError,
  selectProofs,
  selectProofsLoading,
  selectProofsError,
  selectSettlements,
  selectSettlementsLoading,
  selectSettlementsError,
  selectApprovals,
  selectApprovalsLoading,
  selectApprovalsError,
  selectDashboardStats,
  selectDashboardLoading,
  selectDashboardError,
  clearErrors,
} from '../store/slices/erpSlice';
import { showSnackbar } from '../store/slices/uiSlice';

/**
 * Hook for managing IOUs with Redux
 */
export const useIOUs = () => {
  const dispatch = useDispatch();
  const ious = useSelector(selectIOUs);
  const loading = useSelector(selectIOUsLoading);
  const error = useSelector(selectIOUsError);

  const fetchIOUs = async (filters = {}) => {
    try {
      await dispatch(fetchIOUsAsync(filters)).unwrap();
      return { success: true };
    } catch (error) {
      dispatch(showSnackbar({
        message: `Failed to fetch IOUs: ${error}`,
        type: 'error',
      }));
      return { success: false, error };
    }
  };

  const createIOU = async (iouData) => {
    try {
      const newIOU = await dispatch(createIOUAsync(iouData)).unwrap();
      dispatch(showSnackbar({
        message: 'IOU created successfully!',
        type: 'success',
      }));
      return { success: true, data: newIOU };
    } catch (error) {
      dispatch(showSnackbar({
        message: `Failed to create IOU: ${error}`,
        type: 'error',
      }));
      return { success: false, error };
    }
  };

  const updateIOU = async (id, iouData) => {
    try {
      const updatedIOU = await dispatch(updateIOUAsync({ id, iouData })).unwrap();
      dispatch(showSnackbar({
        message: 'IOU updated successfully!',
        type: 'success',
      }));
      return { success: true, data: updatedIOU };
    } catch (error) {
      dispatch(showSnackbar({
        message: `Failed to update IOU: ${error}`,
        type: 'error',
      }));
      return { success: false, error };
    }
  };

  const deleteIOU = async (id) => {
    try {
      await dispatch(deleteIOUAsync(id)).unwrap();
      dispatch(showSnackbar({
        message: 'IOU deleted successfully!',
        type: 'success',
      }));
      return { success: true };
    } catch (error) {
      dispatch(showSnackbar({
        message: `Failed to delete IOU: ${error}`,
        type: 'error',
      }));
      return { success: false, error };
    }
  };

  return {
    ious,
    loading,
    error,
    fetchIOUs,
    createIOU,
    updateIOU,
    deleteIOU,
  };
};

/**
 * Hook for managing Proofs with Redux
 */
export const useProofs = () => {
  const dispatch = useDispatch();
  const proofs = useSelector(selectProofs);
  const loading = useSelector(selectProofsLoading);
  const error = useSelector(selectProofsError);

  const fetchProofs = async (filters = {}) => {
    try {
      await dispatch(fetchProofsAsync(filters)).unwrap();
      return { success: true };
    } catch (error) {
      dispatch(showSnackbar({
        message: `Failed to fetch proofs: ${error}`,
        type: 'error',
      }));
      return { success: false, error };
    }
  };

  const createProof = async (proofData) => {
    try {
      const newProof = await dispatch(createProofAsync(proofData)).unwrap();
      dispatch(showSnackbar({
        message: 'Proof created successfully!',
        type: 'success',
      }));
      return { success: true, data: newProof };
    } catch (error) {
      dispatch(showSnackbar({
        message: `Failed to create proof: ${error}`,
        type: 'error',
      }));
      return { success: false, error };
    }
  };

  return {
    proofs,
    loading,
    error,
    fetchProofs,
    createProof,
  };
};

/**
 * Hook for managing Settlements with Redux
 */
export const useSettlements = () => {
  const dispatch = useDispatch();
  const settlements = useSelector(selectSettlements);
  const loading = useSelector(selectSettlementsLoading);
  const error = useSelector(selectSettlementsError);

  const fetchSettlements = async (filters = {}) => {
    try {
      await dispatch(fetchSettlementsAsync(filters)).unwrap();
      return { success: true };
    } catch (error) {
      dispatch(showSnackbar({
        message: `Failed to fetch settlements: ${error}`,
        type: 'error',
      }));
      return { success: false, error };
    }
  };

  const createSettlement = async (settlementData) => {
    try {
      const newSettlement = await dispatch(createSettlementAsync(settlementData)).unwrap();
      dispatch(showSnackbar({
        message: 'Settlement created successfully!',
        type: 'success',
      }));
      return { success: true, data: newSettlement };
    } catch (error) {
      dispatch(showSnackbar({
        message: `Failed to create settlement: ${error}`,
        type: 'error',
      }));
      return { success: false, error };
    }
  };

  return {
    settlements,
    loading,
    error,
    fetchSettlements,
    createSettlement,
  };
};

/**
 * Hook for managing Approvals with Redux
 */
export const useApprovals = () => {
  const dispatch = useDispatch();
  const approvals = useSelector(selectApprovals);
  const loading = useSelector(selectApprovalsLoading);
  const error = useSelector(selectApprovalsError);

  const fetchApprovals = async (filters = {}) => {
    try {
      await dispatch(fetchApprovalsAsync(filters)).unwrap();
      return { success: true };
    } catch (error) {
      dispatch(showSnackbar({
        message: `Failed to fetch approvals: ${error}`,
        type: 'error',
      }));
      return { success: false, error };
    }
  };

  const approveItem = async (id, approvalData = {}) => {
    try {
      await dispatch(approveItemAsync({ id, approvalData })).unwrap();
      dispatch(showSnackbar({
        message: 'Item approved successfully!',
        type: 'success',
      }));
      return { success: true };
    } catch (error) {
      dispatch(showSnackbar({
        message: `Failed to approve item: ${error}`,
        type: 'error',
      }));
      return { success: false, error };
    }
  };

  const rejectItem = async (id, rejectionData = {}) => {
    try {
      await dispatch(rejectItemAsync({ id, rejectionData })).unwrap();
      dispatch(showSnackbar({
        message: 'Item rejected successfully!',
        type: 'success',
      }));
      return { success: true };
    } catch (error) {
      dispatch(showSnackbar({
        message: `Failed to reject item: ${error}`,
        type: 'error',
      }));
      return { success: false, error };
    }
  };

  return {
    approvals,
    loading,
    error,
    fetchApprovals,
    approveItem,
    rejectItem,
  };
};

/**
 * Hook for dashboard statistics
 */
export const useDashboard = () => {
  const dispatch = useDispatch();
  const stats = useSelector(selectDashboardStats);
  const loading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);

  const fetchDashboardStats = async () => {
    try {
      await dispatch(fetchDashboardStatsAsync()).unwrap();
      return { success: true };
    } catch (error) {
      dispatch(showSnackbar({
        message: `Failed to fetch dashboard stats: ${error}`,
        type: 'error',
      }));
      return { success: false, error };
    }
  };

  return {
    stats,
    loading,
    error,
    fetchDashboardStats,
  };
};

/**
 * Hook for clearing all ERP errors
 */
export const useERPErrors = () => {
  const dispatch = useDispatch();

  const clearAllErrors = () => {
    dispatch(clearErrors());
  };

  return {
    clearAllErrors,
  };
};