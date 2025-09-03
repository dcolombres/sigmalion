
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LoadingSpinner from '../components/LoadingSpinner.vue';

describe('LoadingSpinner', () => {
  it('renders the spinner correctly', () => {
    const wrapper = mount(LoadingSpinner);
    expect(wrapper.find('.spinner').exists()).toBe(true);
  });
});
