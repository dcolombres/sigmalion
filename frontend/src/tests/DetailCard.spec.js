import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import DetailCard from '../components/DetailCard.vue';

describe('DetailCard', () => {
  const mockFields = [
    { key: 'name', label: 'Name' },
    { key: 'isActive', label: 'Active', type: 'boolean' },
    { key: 'startDate', label: 'Start Date', type: 'date' },
    { key: 'website', label: 'Website', type: 'url' },
  ];

  it('renders title and no data message when data is null', () => {
    const wrapper = mount(DetailCard, {
      props: {
        title: 'Test Card',
        fields: mockFields,
        data: null,
      },
    });
    expect(wrapper.find('h5').text()).toContain('Test Card');
    expect(wrapper.text()).toContain('No hay datos disponibles.');
  });

  it('renders data correctly', () => {
    const mockData = {
      name: 'Item Name',
      isActive: true,
      startDate: '2023-01-15T00:00:00.000Z',
      website: 'https://example.com',
    };
    const wrapper = mount(DetailCard, {
      props: {
        title: 'Test Card',
        fields: mockFields,
        data: mockData,
      },
    });

    expect(wrapper.text()).toContain('Item Name');
    expect(wrapper.text()).toContain('Sí'); // Boolean type
    // Verificar que la fecha formateada esté presente en el texto
    expect(wrapper.text()).toContain(new Date(mockData.startDate).toLocaleDateString());
    expect(wrapper.find('a[href="https://example.com"]').exists()).toBe(true); // URL type
  });

  it('shows icon when provided', () => {
    const wrapper = mount(DetailCard, {
      props: {
        title: 'Test Card',
        icon: 'fa-star',
        fields: mockFields,
        data: {},
      },
    });
    expect(wrapper.find('.fa-star').exists()).toBe(true);
  });

  it('shows edit button when editable is true', () => {
    const wrapper = mount(DetailCard, {
      props: {
        title: 'Test Card',
        fields: mockFields,
        data: {},
        editable: true,
      },
    });
    expect(wrapper.find('.btn-outline-primary').exists()).toBe(true);
  });

  it('emits \'edit\' event when edit button is clicked', async () => {
    const wrapper = mount(DetailCard, {
      props: {
        title: 'Test Card',
        fields: mockFields,
        data: {},
        editable: true,
      },
    });
    await wrapper.find('.btn-outline-primary').trigger('click');
    expect(wrapper.emitted().edit).toBeTruthy();
  });
});