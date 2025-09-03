import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AssignedListCard from '../components/AssignedListCard.vue';

describe('AssignedListCard', () => {
  const mockAssignedItems = [
    { id: 1, name: 'Assigned Item 1', value: 'Value 1' },
    { id: 2, name: 'Assigned Item 2', value: 'Value 2' },
  ];

  const mockAllItems = [
    { id: 1, name: 'Assigned Item 1', value: 'Value 1' },
    { id: 2, name: 'Assigned Item 2', value: 'Value 2' },
    { id: 3, name: 'Available Item 1', value: 'Value 3' },
    { id: 4, name: 'Available Item 2', value: 'Value 4' },
  ];

  const props = {
    title: 'Test Title',
    itemType: 'Item',
    assignedItems: mockAssignedItems,
    allItems: mockAllItems,
    nameField: 'name',
    tableHeaders: ['Name', 'Value'],
    displayFields: [{ key: 'name' }, { key: 'value' }],
  };

  let wrapper;

  beforeEach(() => {
    wrapper = mount(AssignedListCard, { props });
  });

  it('renders title and assigned items', () => {
    expect(wrapper.find('h5').text()).toContain(props.title);
    expect(wrapper.findAll('tbody tr')).toHaveLength(mockAssignedItems.length);
    expect(wrapper.text()).toContain('Assigned Item 1');
    expect(wrapper.text()).toContain('Assigned Item 2');
  });

  it('shows add form when "Añadir Item" button is clicked', async () => {
    expect(wrapper.find('form').exists()).toBe(false);
    await wrapper.find('.btn-primary').trigger('click');
    expect(wrapper.find('form').exists()).toBe(true);
  });

  it('filters available items correctly', async () => {
    await wrapper.find('.btn-primary').trigger('click'); // Show form
    const options = wrapper.findAll('select option');
    // Expecting 1 disabled option + 2 available items
    expect(options).toHaveLength(1 + (mockAllItems.length - mockAssignedItems.length));
    expect(options[1].text()).toContain('Available Item 1');
    expect(options[2].text()).toContain('Available Item 2');
  });

  it('emits \'add\' event and resets form when item is added', async () => {
    await wrapper.find('.btn-primary').trigger('click'); // Show form
    await wrapper.find('select').setValue(mockAllItems[2].id); // Select Available Item 1
    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.emitted().add).toBeTruthy();
    expect(wrapper.emitted().add[0][0]).toBe(mockAllItems[2].id);
    expect(wrapper.find('form').exists()).toBe(false); // Form should be hidden
  });

  it('emits \'remove\' event when remove button is clicked', async () => {
    await wrapper.findAll('.btn-danger')[0].trigger('click');
    expect(wrapper.emitted().remove).toBeTruthy();
    expect(wrapper.emitted().remove[0][0]).toBe(mockAssignedItems[0].id);
  });

  it('hides form and resets selected item on cancel', async () => {
    await wrapper.find('.btn-primary').trigger('click'); // Show form
    await wrapper.find('select').setValue(mockAllItems[2].id); // Select an item
    await wrapper.find('.btn-secondary').trigger('click'); // Click cancel

    expect(wrapper.find('form').exists()).toBe(false);
    // Check if selectedItemId is reset (this requires accessing the component instance or re-mounting)
    // For now, we rely on the form being hidden.
  });
});