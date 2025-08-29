// store/dashboard-store.ts
import { create } from 'zustand';

interface DashboardState {
  csvFile: File | null;
  template: string;
  setCsvFile: (file: File | null) => void;
  setTemplate: (templateId: string) => void;
  handleSubmit: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  csvFile: null,
  template: '',

  setCsvFile: (file) => set({ csvFile: file }),
  setTemplate: (templateId) => set({ template: templateId }),

  handleSubmit: async () => {
    const { csvFile, template } = get();

    if (!csvFile || !template) {
      alert("Please upload a CSV file and select a template.");
      return;
    }

    const formData = new FormData();
    formData.append('csvFile', csvFile);
    formData.append('templateId', template);

    try {
      // Replace with your actual backend endpoint
      const response = await fetch('/api/your-backend-endpoint', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Success:', result);
      alert('Job started successfully!');
      // Optionally reset the form state after submission
      set({ csvFile: null, template: '' });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to start job.');
    }
  },
}));