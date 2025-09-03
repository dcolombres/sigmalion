
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ToastNotification from '../components/ToastNotification.vue';

describe('ToastNotification', () => {
  it('renders with default info type', () => {
    const wrapper = mount(ToastNotification, { props: { message: 'Test Message' } });
    expect(wrapper.text()).toContain('Test Message');
    expect(wrapper.classes()).toContain('bg-info');
  });

  it('renders with success type', () => {
    const wrapper = mount(ToastNotification, { props: { message: 'Success', type: 'success' } });
    expect(wrapper.classes()).toContain('bg-success');
  });

  it('renders with error type', () => {
    const wrapper = mount(ToastNotification, { props: { message: 'Error', type: 'error' } });
    expect(wrapper.classes()).toContain('bg-danger');
  });

  it('renders with warning type', () => {
    const wrapper = mount(ToastNotification, { props: { message: 'Warning', type: 'warning' } });
    expect(wrapper.classes()).toContain('bg-warning');
  });

  it('emits update:show event when close button is clicked', async () => {
    const wrapper = mount(ToastNotification, { props: { message: 'Test Message', show: true } });
    await wrapper.find('.btn-close').trigger('click');
    expect(wrapper.emitted()['update:show'][0]).toEqual([false]);
  });
});
