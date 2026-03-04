import http from './http';


export const testBackendConnection = async (): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    console.log('🔍 Testing backend connection...');
    console.log('📍 API URL:', process.env.NEXT_PUBLIC_API_URL);
    
    const response = await http.get('/health');
    
    if (response.data.success) {
      console.log('✅ Backend connection successful!');
      return {
        success: true,
        message: 'Backend is connected and working',
        data: response.data
      };
    } else {
      console.error('❌ Backend responded but not healthy');
      return {
        success: false,
        message: 'Backend responded with unhealthy status'
      };
    }
  } catch (error: any) {
    console.error('❌ Backend connection failed:', error.message);
    console.error('🔍 Error details:', error.response?.status, error.response?.data);
    
    if (error.code === 'ECONNREFUSED') {
      return {
        success: false,
        message: 'Cannot connect to backend. Is the server running on port 5000?'
      };
    }
    
    if (error.code === 'ERR_NETWORK') {
      return {
        success: false,
        message: 'Network error. Check CORS settings and backend availability.'
      };
    }
    
    return {
      success: false,
      message: error.response?.data?.message || 'Connection test failed'
    };
  }
};
