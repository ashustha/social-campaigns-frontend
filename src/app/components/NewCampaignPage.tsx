import { useEffect, useMemo, useState, type ComponentProps } from 'react';
import { useNavigate } from 'react-router';
import { CampaignCard } from './CampaignCard';
import Header from './Header';
import { ChevronLeft } from 'lucide-react';
import {
  createCampaign,
  type CampaignType,
  type CreateCampaignInput,
} from '../services/campaignApi';
import { toast } from '../utils/toast';
import { useAuth } from '../context/AuthContext';

const DEFAULT_CAMPAIGN_IMAGE = '/uploads/default-campaign.svg';

const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png']);

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const CAMPAIGN_TYPE_OPTIONS: Array<{
  value: CampaignType;
  label: string;
}> = [
  { value: 'cause', label: 'Social Cause' },
  { value: 'business', label: 'Small Business' },
];

const LOCATION_OPTIONS = [
  { value: '', label: 'Select a state' },
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

function formatDateForInput(date: Date) {
  return date.toISOString().split('T')[0];
}

function formatDateForPreview(dateValue: string) {
  if (!dateValue) {
    return new Date().toLocaleDateString();
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return parsedDate.toLocaleDateString();
}

const createInitialFormData = (): CreateCampaignInput => ({
  title: '',
  description: '',
  type: 'cause',
  category: '',
  location: '',
  contact_email: '',
  goal: '',
  imageFile: null,
  imagePreview: DEFAULT_CAMPAIGN_IMAGE,
  startDate: formatDateForInput(new Date()),
  endDate: formatDateForInput(new Date(Date.now() + 30 * DAY_IN_MS)),
  supporters: '0',
});

type CampaignFormField =
  | 'title'
  | 'type'
  | 'category'
  | 'location'
  | 'startDate'
  | 'endDate'
  | 'contact_email'
  | 'description'
  | 'goal';

type CampaignFormErrors = Partial<Record<CampaignFormField, string>>;

const REQUIRED_FIELDS: CampaignFormField[] = [
  'title',
  'type',
  'category',
  'location',
  'startDate',
  'endDate',
  'contact_email',
  'description',
  'goal',
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCampaignForm(
  formData: CreateCampaignInput,
): CampaignFormErrors {
  const errors: CampaignFormErrors = {};
  const contactEmail = formData.contact_email ?? '';
  const today = formatDateForInput(new Date());

  if (!formData.title.trim()) {
    errors.title = 'Campaign title is required.';
  }

  if (!formData.category.trim()) {
    errors.category = 'Category is required.';
  }

  if (!formData.location) {
    errors.location = 'Location is required.';
  }

  if (!formData.startDate) {
    errors.startDate = 'Start date is required.';
  } else if (formData.startDate < today) {
    errors.startDate = 'Start date cannot be in the past.';
  }

  if (!formData.endDate) {
    errors.endDate = 'End date is required.';
  } else if (formData.endDate < today) {
    errors.endDate = 'End date cannot be in the past.';
  }

  if (formData.startDate && formData.endDate) {
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      errors.endDate = 'End date must be on or after the start date.';
    }
  }

  if (!contactEmail.trim()) {
    errors.contact_email = 'Contact email is required.';
  } else if (!EMAIL_REGEX.test(contactEmail.trim())) {
    errors.contact_email = 'Enter a valid email address.';
  }

  if (!formData.description.trim()) {
    errors.description = 'Description is required.';
  }

  if (!formData.goal.trim()) {
    errors.goal = 'Goals are required.';
  }

  return errors;
}

function getInputClassName(hasError: boolean) {
  return `mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
    hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
  }`;
}

export function NewCampaignPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userCampaignType: CampaignType =
    user?.role === 'business' ? 'business' : 'cause';
  const todayDate = formatDateForInput(new Date());
  const [formData, setFormData] = useState<CreateCampaignInput>(() => ({
    ...createInitialFormData(),
    type: userCampaignType,
  }));
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<
    Partial<Record<CampaignFormField, boolean>>
  >({});

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  const previewCampaign: ComponentProps<typeof CampaignCard>['campaign'] =
    useMemo(
      () => ({
        id: 'preview',
        title: formData.title || 'Untitled campaign',
        description:
          formData.description || 'Your campaign summary will show here.',
        image: formData.imagePreview || DEFAULT_CAMPAIGN_IMAGE,
        type: formData.type,
        category: formData.category || 'General',
        startDate: formatDateForPreview(formData.startDate),
        endDate: formatDateForPreview(formData.endDate),
        supporters: formData.supporters || '0',
        upvotes: 0,
        downvotes: 0,
      }),
      [formData],
    );

  const validationErrors = useMemo(
    () => validateCampaignForm(formData),
    [formData],
  );

  const isFormValid = Object.keys(validationErrors).length === 0;
  const isSubmitDisabled = isSubmitting || !isFormValid;

  const markFieldTouched = (field: CampaignFormField) => {
    setTouchedFields((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const markAllFieldsTouched = () => {
    setTouchedFields(
      REQUIRED_FIELDS.reduce<Partial<Record<CampaignFormField, boolean>>>(
        (fields, field) => {
          fields[field] = true;
          return fields;
        },
        {},
      ),
    );
  };

  const getFieldError = (field: CampaignFormField) => {
    if (!touchedFields[field]) {
      return '';
    }

    return validationErrors[field] || '';
  };

  const handleInputChange = <K extends keyof CreateCampaignInput>(
    field: K,
    value: CreateCampaignInput[K],
  ) => {
    setSubmitError('');

    if (field === 'startDate' && typeof value === 'string') {
      setFormData((prev) => {
        const nextStartDate = value;
        const nextEndDate =
          prev.endDate && prev.endDate < nextStartDate
            ? nextStartDate
            : prev.endDate;

        return {
          ...prev,
          startDate: nextStartDate,
          endDate: nextEndDate,
        };
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        setObjectUrl(null);
      }
      setFormData((prev) => ({
        ...prev,
        imageFile: null,
        imagePreview: DEFAULT_CAMPAIGN_IMAGE,
      }));
      return;
    }

    const lowerFileName = file.name.toLowerCase();
    const hasAllowedExtension =
      lowerFileName.endsWith('.jpg') ||
      lowerFileName.endsWith('.jpeg') ||
      lowerFileName.endsWith('.png');

    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type) && !hasAllowedExtension) {
      event.target.value = '';
      setSubmitError('Only JPG, JPEG, PNG images are allowed.');
      toast.error(
        'Invalid image type',
        'Only JPG, JPEG, PNG images are allowed.',
      );
      return;
    }

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }

    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    setFormData((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: url,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitError('');

    markAllFieldsTouched();

    if (!isFormValid) {
      const firstError = Object.values(validationErrors)[0];
      const message = firstError || 'Please complete all required fields.';
      setSubmitError(message);
      toast.error('Fix form errors', message);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createCampaign(formData);

      if (!response.success) {
        setSubmitError(response.message);
        toast.error('Campaign submission failed', response.message);
        return;
      }

      toast.success(
        'Campaign submitted',
        response.message || 'Your campaign has been queued successfully.',
      );

      setFormData(createInitialFormData());
      navigate('/dashboard');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to submit campaign.';
      setSubmitError(message);
      toast.error('Campaign submission failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header
        title="Create Campaign"
        subtitle="Build your campaign and preview it live"
        back={{
          position: 'left',
          to: '/dashboard',
          label: 'Back to Dashboard',
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-gray-500 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Go back"
          >
            <ChevronLeft className="size-5" />
          </button>
          <span className="text-sm">Back</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="bg-white rounded-2xl p-4 shadow-md lg:col-span-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Live Preview
            </h3>
            <CampaignCard campaign={previewCampaign} onReadMore={() => {}} />
          </aside>

          <section className="bg-white rounded-2xl p-6 shadow-md lg:col-span-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create New Campaign
            </h2>
            <p className="text-gray-600 mb-6">
              Fill all required fields and see updates live in the preview.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="campaign-title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Campaign Title *
                  </label>
                  <input
                    id="campaign-title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    onBlur={() => markFieldTouched('title')}
                    aria-invalid={Boolean(getFieldError('title'))}
                    required
                    placeholder="Enter a title your audience will recognize"
                    className={getInputClassName(
                      Boolean(getFieldError('title')),
                    )}
                  />
                  {getFieldError('title') && (
                    <p className="mt-1 text-sm text-red-600">
                      {getFieldError('title')}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="campaign-category"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Category *
                  </label>
                  <input
                    id="campaign-category"
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange('category', e.target.value)
                    }
                    onBlur={() => markFieldTouched('category')}
                    aria-invalid={Boolean(getFieldError('category'))}
                    required
                    placeholder="Environment, Education, Health..."
                    className={getInputClassName(
                      Boolean(getFieldError('category')),
                    )}
                  />
                  {getFieldError('category') && (
                    <p className="mt-1 text-sm text-red-600">
                      {getFieldError('category')}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="campaign-type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Campaign Type
                </label>
                <input
                  id="campaign-type"
                  type="text"
                  value={
                    userCampaignType === 'business'
                      ? 'Small Business'
                      : 'Social Cause'
                  }
                  disabled
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label
                  htmlFor="campaign-location"
                  className="block text-sm font-medium text-gray-700"
                >
                  Location *
                </label>
                <select
                  id="campaign-location"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange('location', e.target.value)
                  }
                  onBlur={() => markFieldTouched('location')}
                  aria-invalid={Boolean(getFieldError('location'))}
                  required
                  className={getInputClassName(
                    Boolean(getFieldError('location')),
                  )}
                >
                  {LOCATION_OPTIONS.map((option) => (
                    <option
                      key={option.value || 'placeholder'}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                {getFieldError('location') && (
                  <p className="mt-1 text-sm text-red-600">
                    {getFieldError('location')}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="campaign-start-date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Start Date *
                  </label>
                  <input
                    id="campaign-start-date"
                    type="date"
                    value={formData.startDate}
                    min={todayDate}
                    onChange={(e) =>
                      handleInputChange('startDate', e.target.value)
                    }
                    onBlur={() => markFieldTouched('startDate')}
                    aria-invalid={Boolean(getFieldError('startDate'))}
                    required
                    className={getInputClassName(
                      Boolean(getFieldError('startDate')),
                    )}
                  />
                  {getFieldError('startDate') && (
                    <p className="mt-1 text-sm text-red-600">
                      {getFieldError('startDate')}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="campaign-end-date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    End Date *
                  </label>
                  <input
                    id="campaign-end-date"
                    type="date"
                    value={formData.endDate}
                    min={formData.startDate || todayDate}
                    onChange={(e) =>
                      handleInputChange('endDate', e.target.value)
                    }
                    onBlur={() => markFieldTouched('endDate')}
                    aria-invalid={Boolean(getFieldError('endDate'))}
                    required
                    className={getInputClassName(
                      Boolean(getFieldError('endDate')),
                    )}
                  />
                  {getFieldError('endDate') && (
                    <p className="mt-1 text-sm text-red-600">
                      {getFieldError('endDate')}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="campaign-contact"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contact Email *
                </label>
                <input
                  id="campaign-contact"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) =>
                    handleInputChange('contact_email', e.target.value)
                  }
                  onBlur={() => markFieldTouched('contact_email')}
                  aria-invalid={Boolean(getFieldError('contact_email'))}
                  required
                  placeholder="you@example.com"
                  className={getInputClassName(
                    Boolean(getFieldError('contact_email')),
                  )}
                />
                {getFieldError('contact_email') && (
                  <p className="mt-1 text-sm text-red-600">
                    {getFieldError('contact_email')}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="campaign-image"
                  className="block text-sm font-medium text-gray-700"
                >
                  Image (optional)
                </label>
                <input
                  id="campaign-image"
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  onChange={handleImageChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label
                  htmlFor="campaign-description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description *
                </label>
                <textarea
                  id="campaign-description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  onBlur={() => markFieldTouched('description')}
                  aria-invalid={Boolean(getFieldError('description'))}
                  required
                  placeholder="Explain what you are raising support for and why it matters"
                  className={getInputClassName(
                    Boolean(getFieldError('description')),
                  )}
                />
                {getFieldError('description') && (
                  <p className="mt-1 text-sm text-red-600">
                    {getFieldError('description')}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="campaign-goal"
                  className="block text-sm font-medium text-gray-700"
                >
                  Goals *
                </label>
                <textarea
                  id="campaign-goal"
                  rows={3}
                  value={formData.goal}
                  onChange={(e) => handleInputChange('goal', e.target.value)}
                  onBlur={() => markFieldTouched('goal')}
                  aria-invalid={Boolean(getFieldError('goal'))}
                  required
                  placeholder="List the concrete outcomes this campaign should achieve"
                  className={getInputClassName(Boolean(getFieldError('goal')))}
                />
                {getFieldError('goal') && (
                  <p className="mt-1 text-sm text-red-600">
                    {getFieldError('goal')}
                  </p>
                )}
              </div>

              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-white font-semibold hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                  {isSubmitting ? 'Submitting...' : 'Publish Campaign'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
