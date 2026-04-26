import api from './axios';

export const syncOrganization = async (clerkOrgId, name) => {
  try {
    const response = await api.post('/orgs/sync', { clerkOrgId, name });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const joinByCode = async (joinCode) => {
  try {
    const response = await api.post('/orgs/join', { joinCode });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateMemberRole = async (userId, role) => {
  try {
    const response = await api.patch(`/orgs/members/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    throw error;
  }
};
