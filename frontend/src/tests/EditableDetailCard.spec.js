import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import EditableDetailCard from '../components/EditableDetailCard.vue';

describe('EditableDetailCard', () => {
  const mockData = {
    id: 1,
    name: 'Test Item',
    email: 'test@example.com',
    age: 30,
    description: 'Long description here.',
    status: 'active',
    isPublic: true,
    startDate: '2023-01-15T00:00:00.000Z',
  };

  const mockFields = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'age', label: 'Age' },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status' },
    { key: 'isPublic', label: 'Public' },
    { key: 'startDate', label: 'Start Date' },
  ];

  const mockFormFields = [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'age', label: 'Age', type: 'number' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'status', label: 'Status', type: 'select', options: [{ value: 'active', text: 'Active' }, { value: 'inactive', text: 'Inactive' }] },
    { key: 'isPublic', label: 'Public', type: 'checkbox' },
    { key: 'startDate', label: 'Start Date', type: 'date' },
  ];

  let wrapper;

  beforeEach(() => {
    wrapper = mount(EditableDetailCard, {
      props: {
        title: 'Test Editable Card',
        data: mockData,
        fields: mockFields,
        formFields: mockFormFields,
      },
    });
  });

  it('renders in view mode initially', () => {
    expect(wrapper.find('form').exists()).toBe(false);
    expect(wrapper.find('.card-text').exists()).toBe(true);
    expect(wrapper.text()).toContain('Test Item');
    expect(wrapper.text()).toContain('test@example.com');
  });

  it('switches to edit mode when "Editar" button is clicked', async () => {
    await wrapper.find('.btn-primary').trigger('click');
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('.card-text').exists()).toBe(false);
    expect(wrapper.find('input[type="text"]').element.value).toBe(mockData.name);
    expect(wrapper.find('input[type="email"]').element.value).toBe(mockData.email);
    expect(wrapper.find('input[type="number"]').element.value).toBe(String(mockData.age));
    expect(wrapper.find('textarea').element.value).toBe(mockData.description);
    expect(wrapper.find('select').element.value).toBe(mockData.status);
    expect(wrapper.find('input[type="checkbox"]').element.checked).toBe(mockData.isPublic);
    expect(wrapper.find('input[type="date"]').element.value).toBe('2023-01-15');
  });

  it('emits \'save\' event with updated data when form is submitted', async () => {
    await wrapper.find('.btn-primary').trigger('click'); // Enter edit mode
    await wrapper.find('input[type="text"]').setValue('Updated Name');
    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.emitted().save).toBeTruthy();
    expect(wrapper.emitted().save[0][0].name).toBe('Updated Name');
    expect(wrapper.find('form').exists()).toBe(false); // Should return to view mode
  });

  it('emits \'cancel\' event and reverts data when cancel button is clicked', async () => {
    await wrapper.find('.btn-primary').trigger('click'); // Enter edit mode
    await wrapper.find('input[type="text"]').setValue('Temporary Name');
    await wrapper.find('.btn-secondary').trigger('click'); // Click cancel

    expect(wrapper.emitted().cancel).toBeTruthy();
    expect(wrapper.find('form').exists()).toBe(false); // Should return to view mode
    expect(wrapper.text()).toContain(mockData.name); // Data should revert
  });
});
