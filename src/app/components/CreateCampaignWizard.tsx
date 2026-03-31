import { X, Plus } from 'lucide-react';
import { useState } from 'react';

interface CreateCampaignWizardProps {
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

export function CreateCampaignWizard({
  onClose,
  onSubmit,
}: CreateCampaignWizardProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'cause',
    category: '',
    description: '',
    location: '',
    contact_email: '',
    goal: '',
    image: null as File | null,
    videoUrl: '',
    imagePreview: '',
  });
  const [contactError, setContactError] = useState('');

  const australianStates = [
    { value: 'NSW', label: 'New South Wales (NSW)' },
    { value: 'VIC', label: 'Victoria (VIC)' },
    { value: 'QLD', label: 'Queensland (QLD)' },
    { value: 'WA', label: 'Western Australia (WA)' },
    { value: 'SA', label: 'South Australia (SA)' },
    { value: 'TAS', label: 'Tasmania (TAS)' },
    { value: 'ACT', label: 'Australian Capital Territory (ACT)' },
    { value: 'NT', label: 'Northern Territory (NT)' },
    { value: 'Other', label: 'Other / Online' },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // final validation for contact email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.contact_email || !emailRegex.test(formData.contact_email)) {
      setContactError('Please enter a valid contact email');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div
      className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Create Your Campaign
            </h2>
            <p className="text-sm text-gray-500 mt-1">One-page campaign form</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Campaign Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter a compelling title"
                required
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Campaign Type *
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="cause">Social Cause</option>
                <option value="business">Small Business</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category *
              </label>
              <input
                type="text"
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Environment, Education, Health"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Describe your campaign in detail"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Location *
                </label>
                <select
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange('location', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a state or region</option>
                  {australianStates.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="contact_email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contact Email *
                </label>
                <input
                  type="email"
                  id="contact_email"
                  value={formData.contact_email}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleInputChange('contact_email', val);
                    if (
                      contactError &&
                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
                    ) {
                      setContactError('');
                    }
                  }}
                  onBlur={(e) => {
                    const val = e.target.value;
                    if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                      setContactError('Please enter a valid contact email');
                    } else {
                      setContactError('');
                    }
                  }}
                  className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${contactError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                  placeholder="your@email.com"
                  aria-invalid={Boolean(contactError)}
                  required
                />
                {contactError && (
                  <p className="mt-1 text-sm text-red-600">{contactError}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Campaign Image
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {formData.imagePreview && (
                <div className="mt-3 relative h-48 rounded-lg overflow-hidden">
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="videoUrl"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Video URL (Optional)
              </label>
              <input
                type="url"
                id="videoUrl"
                value={formData.videoUrl}
                onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://youtube.com/embed/..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter a YouTube or Vimeo embed URL
              </p>
            </div>

            <div>
              <label
                htmlFor="goal"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Campaign Goals *
              </label>
              <textarea
                id="goal"
                value={formData.goal}
                onChange={(e) => handleInputChange('goal', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="List your campaign goals (one per line)"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter each goal on a new line
              </p>
            </div>
          </div>

          <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="size-4" />
              Submit Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
