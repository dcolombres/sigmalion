import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ListView from '../components/ListView.vue';
import { RouterLinkStub } from '@vue/test-utils';

describe('ListView', () => {
  const mockItems = [
    { id: 1, name: 'Item 1', description: 'Desc 1' },
    { id: 2, name: 'Item 2', description: 'Desc 2' },
  ];

  const mockTableHeaders = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'description', label: 'Description', sortable: false },
  ];

  const mockDisplayFields = [
    { key: 'name' },
    { key: 'description', truncate: 5 },
  ];

  const defaultProps = {
    title: 'Test List',
    itemType: 'Test Item',
    items: mockItems,
    tableHeaders: mockTableHeaders,
    displayFields: mockDisplayFields,
    searchQuery: '',
    searchPlaceholder: 'Search...',
    isLoading: false,
    error: null,
    currentPage: 1,
    totalPages: 2,
    showForm: false,
    formTitle: 'Add Test Item',
    detailRouteName: 'test-detail',
    sortKey: '',
    sortOrder: 'asc',
  };

  let wrapper;

  beforeEach(() => {
    wrapper = mount(ListView, {
      props: defaultProps,
      global: {
        stubs: { RouterLink: RouterLinkStub },
      },
    });
  });

  it('renders title and add button', () => {
    expect(wrapper.find('h1').text()).toContain(defaultProps.title);
    expect(wrapper.find('.list-header .btn-primary').text()).toContain(`Añadir ${defaultProps.itemType}`);
  });

  it('shows add form when showForm is true', async () => {
    await wrapper.setProps({ showForm: true });
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('h2').text()).toContain(defaultProps.formTitle);
  });

  it('renders loading state', async () => {
    await wrapper.setProps({ isLoading: true, items: [] });
    expect(wrapper.find('.loading-container').exists()).toBe(true);
    expect(wrapper.text()).toContain('Cargando...');
  });

  it('renders error state', async () => {
    await wrapper.setProps({ error: 'Something went wrong', items: [] });
    expect(wrapper.find('.alert-danger').exists()).toBe(true);
    expect(wrapper.text()).toContain('Something went wrong');
  });

  it('renders table with items', () => {
    expect(wrapper.findAll('tbody tr')).toHaveLength(mockItems.length);
    // Ajustar la expectativa para que no dependa del texto completo
    expect(wrapper.find('tbody tr:first-child').text()).toContain('Item 1');
    expect(wrapper.find('tbody tr:last-child').text()).toContain('Desc ...'); // Truncated text
  });

  it('renders no items message when items array is empty', async () => {
    await wrapper.setProps({ items: [] });
    expect(wrapper.text()).toContain(`No hay ${defaultProps.itemType.toLowerCase()} que coincidan con la búsqueda.`);
  });

  it('emits update:searchQuery on search input', async () => {
    await wrapper.find('input[type="text"]').setValue('new query');
    expect(wrapper.emitted()['update:searchQuery'][0][0]).toBe('new query');
  });

  it('emits prev-page and next-page events', async () => {
    // Asegurarse de que los botones existen antes de hacer clic
    const prevButton = wrapper.find('.card-footer .btn-secondary:first-child');
    const nextButton = wrapper.find('.card-footer .btn-secondary:last-child');

    expect(prevButton.exists()).toBe(true);
    expect(nextButton.exists()).toBe(true);

    await prevButton.trigger('click');
    // Verificar que el evento se emita
    expect(wrapper.emitted()['prev-page']).toHaveLength(1);

    await nextButton.trigger('click');
    // Verificar que el evento se emita
    expect(wrapper.emitted()['next-page']).toHaveLength(1);
  });

  it('disables pagination buttons correctly', async () => {
    // First page, prev button disabled
    expect(wrapper.find('.card-footer .btn-secondary:first-child').attributes().disabled).toBeDefined();
    // Last page, next button disabled
    await wrapper.setProps({ currentPage: 2, totalPages: 2 });
    expect(wrapper.find('.card-footer .btn-secondary:last-child').attributes().disabled).toBeDefined();
  });

  it('emits delete-item event', async () => {
    await wrapper.find('.btn-danger').trigger('click');
    expect(wrapper.emitted()['delete-item'][0][0]).toBe(mockItems[0].id);
  });

  it('emits sort event and shows correct sort icon', async () => {
    await wrapper.findAll('th.sortable')[0].trigger('click');
    expect(wrapper.emitted().sort[0][0]).toBe('name');

    await wrapper.setProps({ sortKey: 'name', sortOrder: 'asc' });
    expect(wrapper.find('.fa-sort-up').exists()).toBe(true);

    await wrapper.setProps({ sortKey: 'name', sortOrder: 'desc' });
    expect(wrapper.find('.fa-sort-down').exists()).toBe(true);
  });

  it('truncates text correctly', () => {
    // El elemento con la clase truncate-text es un span dentro de un td
    const truncatedTextElement = wrapper.find('tbody tr:nth-child(2) td:nth-child(2) span');
    expect(truncatedTextElement.exists()).toBe(true);
    expect(truncatedTextElement.text()).toBe('Desc ...');
  });
});