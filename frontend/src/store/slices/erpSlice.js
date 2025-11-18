import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../../services/ApiService';

// Async thunks for ERP operations

// IOUs
export const fetchIOUsAsync = createAsyncThunk(
  'erp/fetchIOUs',
  async (filters = {}, { rejectWithValue }) => {
    try {
      console.log('📋 Redux: Fetching IOUs...');
      const ious = await apiService.getIOUs(filters);
      return ious;
    } catch (error) {
      console.error('❌ Redux: Fetch IOUs failed:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const createIOUAsync = createAsyncThunk(
  'erp/createIOU',
  async (iouData, { rejectWithValue }) => {
    try {
      console.log('➕ Redux: Creating IOU...');
      const iou = await apiService.createIOU(iouData);
      return iou;
    } catch (error) {
      console.error('❌ Redux: Create IOU failed:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const updateIOUAsync = createAsyncThunk(
  'erp/updateIOU',
  async ({ id, iouData }, { rejectWithValue }) => {
    try {
      console.log('✏️ Redux: Updating IOU:', id);
      const iou = await apiService.updateIOU(id, iouData);
      return { id, iou };
    } catch (error) {
      console.error('❌ Redux: Update IOU failed:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteIOUAsync = createAsyncThunk(
  'erp/deleteIOU',
  async (id, { rejectWithValue }) => {
    try {
      console.log('🗑️ Redux: Deleting IOU:', id);
      await apiService.deleteIOU(id);
      return id;
    } catch (error) {
      console.error('❌ Redux: Delete IOU failed:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Proofs
export const fetchProofsAsync = createAsyncThunk(
  'erp/fetchProofs',
  async (filters = {}, { rejectWithValue }) => {
    try {
      console.log('📄 Redux: Fetching Proofs...');
      const proofs = await apiService.getProofs(filters);
      return proofs;
    } catch (error) {
      console.error('❌ Redux: Fetch Proofs failed:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const createProofAsync = createAsyncThunk(
  'erp/createProof',
  async (proofData, { rejectWithValue }) => {
    try {
      console.log('➕ Redux: Creating Proof...');
      const proof = await apiService.createProof(proofData);
      return proof;
    } catch (error) {
      console.error('❌ Redux: Create Proof failed:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Settlements
export const fetchSettlementsAsync = createAsyncThunk(
  'erp/fetchSettlements',
  async (filters = {}, { rejectWithValue }) => {
    try {
      console.log('🏦 Redux: Fetching Settlements...');
      const settlements = await apiService.getSettlements(filters);
      return settlements;
    } catch (error) {
      console.error('❌ Redux: Fetch Settlements failed:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const createSettlementAsync = createAsyncThunk(
  'erp/createSettlement',
  async (settlementData, { rejectWithValue }) => {
    try {
      console.log('➕ Redux: Creating Settlement...');
      const settlement = await apiService.createSettlement(settlementData);
      return settlement;
    } catch (error) {
      console.error('❌ Redux: Create Settlement failed:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Approvals
export const fetchApprovalsAsync = createAsyncThunk(
  'erp/fetchApprovals',
  async (filters = {}, { rejectWithValue }) => {
    try {
      console.log('✅ Redux: Fetching Approvals...');
      const approvals = await apiService.getApprovals(filters);
      return approvals;
    } catch (error) {
      console.error('❌ Redux: Fetch Approvals failed:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const approveItemAsync = createAsyncThunk(
  'erp/approveItem',
  async ({ id, approvalData }, { rejectWithValue }) => {
    try {
      console.log('✅ Redux: Approving item:', id);
      const result = await apiService.approveItem(id, approvalData);
      return { id, result };
    } catch (error) {
      console.error('❌ Redux: Approve item failed:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const rejectItemAsync = createAsyncThunk(
  'erp/rejectItem',
  async ({ id, rejectionData }, { rejectWithValue }) => {
    try {
      console.log('❌ Redux: Rejecting item:', id);
      const result = await apiService.rejectItem(id, rejectionData);
      return { id, result };
    } catch (error) {
      console.error('❌ Redux: Reject item failed:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Dashboard stats
export const fetchDashboardStatsAsync = createAsyncThunk(
  'erp/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📊 Redux: Fetching Dashboard Stats...');
      const stats = await apiService.getDashboardStats();
      return stats;
    } catch (error) {
      console.error('❌ Redux: Fetch Dashboard Stats failed:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  // IOUs
  ious: [],
  iousLoading: false,
  iousError: null,
  
  // Proofs
  proofs: [],
  proofsLoading: false,
  proofsError: null,
  
  // Settlements
  settlements: [],
  settlementsLoading: false,
  settlementsError: null,
  
  // Approvals
  approvals: [],
  approvalsLoading: false,
  approvalsError: null,
  
  // Dashboard
  dashboardStats: null,
  dashboardLoading: false,
  dashboardError: null,
  
  // General
  lastUpdate: null,
  syncInProgress: false,
};

// ERP slice
const erpSlice = createSlice({
  name: 'erp',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.iousError = null;
      state.proofsError = null;
      state.settlementsError = null;
      state.approvalsError = null;
      state.dashboardError = null;
    },
    clearAllData: (state) => {
      return initialState;
    },
    setSyncInProgress: (state, action) => {
      state.syncInProgress = action.payload;
    },
    updateLastUpdate: (state) => {
      state.lastUpdate = new Date().toISOString();
    },
    // Local optimistic updates
    addIOUOptimistic: (state, action) => {
      state.ious.unshift({ ...action.payload, id: `temp_${Date.now()}` });
    },
    removeIOUOptimistic: (state, action) => {
      state.ious = state.ious.filter(iou => iou.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // IOUs
      .addCase(fetchIOUsAsync.pending, (state) => {
        state.iousLoading = true;
        state.iousError = null;
      })
      .addCase(fetchIOUsAsync.fulfilled, (state, action) => {
        state.iousLoading = false;
        state.ious = action.payload;
        state.lastUpdate = new Date().toISOString();
      })
      .addCase(fetchIOUsAsync.rejected, (state, action) => {
        state.iousLoading = false;
        state.iousError = action.payload;
      })
      
      .addCase(createIOUAsync.pending, (state) => {
        state.iousLoading = true;
        state.iousError = null;
      })
      .addCase(createIOUAsync.fulfilled, (state, action) => {
        state.iousLoading = false;
        state.ious.unshift(action.payload);
        state.lastUpdate = new Date().toISOString();
      })
      .addCase(createIOUAsync.rejected, (state, action) => {
        state.iousLoading = false;
        state.iousError = action.payload;
      })
      
      .addCase(updateIOUAsync.fulfilled, (state, action) => {
        const index = state.ious.findIndex(iou => iou.id === action.payload.id);
        if (index !== -1) {
          state.ious[index] = action.payload.iou;
        }
        state.lastUpdate = new Date().toISOString();
      })
      
      .addCase(deleteIOUAsync.fulfilled, (state, action) => {
        state.ious = state.ious.filter(iou => iou.id !== action.payload);
        state.lastUpdate = new Date().toISOString();
      })
      
      // Proofs
      .addCase(fetchProofsAsync.pending, (state) => {
        state.proofsLoading = true;
        state.proofsError = null;
      })
      .addCase(fetchProofsAsync.fulfilled, (state, action) => {
        state.proofsLoading = false;
        state.proofs = action.payload;
        state.lastUpdate = new Date().toISOString();
      })
      .addCase(fetchProofsAsync.rejected, (state, action) => {
        state.proofsLoading = false;
        state.proofsError = action.payload;
      })
      
      .addCase(createProofAsync.fulfilled, (state, action) => {
        state.proofs.unshift(action.payload);
        state.lastUpdate = new Date().toISOString();
      })
      
      // Settlements
      .addCase(fetchSettlementsAsync.pending, (state) => {
        state.settlementsLoading = true;
        state.settlementsError = null;
      })
      .addCase(fetchSettlementsAsync.fulfilled, (state, action) => {
        state.settlementsLoading = false;
        state.settlements = action.payload;
        state.lastUpdate = new Date().toISOString();
      })
      .addCase(fetchSettlementsAsync.rejected, (state, action) => {
        state.settlementsLoading = false;
        state.settlementsError = action.payload;
      })
      
      .addCase(createSettlementAsync.fulfilled, (state, action) => {
        state.settlements.unshift(action.payload);
        state.lastUpdate = new Date().toISOString();
      })
      
      // Approvals
      .addCase(fetchApprovalsAsync.pending, (state) => {
        state.approvalsLoading = true;
        state.approvalsError = null;
      })
      .addCase(fetchApprovalsAsync.fulfilled, (state, action) => {
        state.approvalsLoading = false;
        state.approvals = action.payload;
        state.lastUpdate = new Date().toISOString();
      })
      .addCase(fetchApprovalsAsync.rejected, (state, action) => {
        state.approvalsLoading = false;
        state.approvalsError = action.payload;
      })
      
      .addCase(approveItemAsync.fulfilled, (state, action) => {
        const index = state.approvals.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.approvals[index].status = 'approved';
        }
        state.lastUpdate = new Date().toISOString();
      })
      
      .addCase(rejectItemAsync.fulfilled, (state, action) => {
        const index = state.approvals.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.approvals[index].status = 'rejected';
        }
        state.lastUpdate = new Date().toISOString();
      })
      
      // Dashboard stats
      .addCase(fetchDashboardStatsAsync.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(fetchDashboardStatsAsync.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardStats = action.payload;
        state.lastUpdate = new Date().toISOString();
      })
      .addCase(fetchDashboardStatsAsync.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError = action.payload;
      });
  },
});

// Export actions
export const {
  clearErrors,
  clearAllData,
  setSyncInProgress,
  updateLastUpdate,
  addIOUOptimistic,
  removeIOUOptimistic,
} = erpSlice.actions;

// Export selectors
export const selectIOUs = (state) => state.erp.ious;
export const selectIOUsLoading = (state) => state.erp.iousLoading;
export const selectIOUsError = (state) => state.erp.iousError;

export const selectProofs = (state) => state.erp.proofs;
export const selectProofsLoading = (state) => state.erp.proofsLoading;
export const selectProofsError = (state) => state.erp.proofsError;

export const selectSettlements = (state) => state.erp.settlements;
export const selectSettlementsLoading = (state) => state.erp.settlementsLoading;
export const selectSettlementsError = (state) => state.erp.settlementsError;

export const selectApprovals = (state) => state.erp.approvals;
export const selectApprovalsLoading = (state) => state.erp.approvalsLoading;
export const selectApprovalsError = (state) => state.erp.approvalsError;

export const selectDashboardStats = (state) => state.erp.dashboardStats;
export const selectDashboardLoading = (state) => state.erp.dashboardLoading;
export const selectDashboardError = (state) => state.erp.dashboardError;

export const selectLastUpdate = (state) => state.erp.lastUpdate;
export const selectSyncInProgress = (state) => state.erp.syncInProgress;

// Export reducer
export default erpSlice.reducer;