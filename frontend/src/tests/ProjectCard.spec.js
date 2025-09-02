import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ProjectCard from '../components/ProjectCard.vue';
import { RouterLinkStub } from '@vue/test-utils';

describe('ProjectCard', () => {
  const mockProyecto = {
    id: 1,
    titulo_proyecto: 'Test Project',
    storyline: 'This is a test storyline.',
    proyecto_activo: true,
  };

  it('renders project data correctly', () => {
    const wrapper = mount(ProjectCard, {
      props: { proyecto: mockProyecto },
      global: {
        stubs: { RouterLink: RouterLinkStub },
      },
    });

    expect(wrapper.find('.card-title').text()).toContain(mockProyecto.titulo_proyecto);
    expect(wrapper.find('.card-subtitle').text()).toContain(`ID: ${mockProyecto.id}`);
    expect(wrapper.find('.card-text').text()).toContain(mockProyecto.storyline);
  });

  it('applies correct badge class for active project', () => {
    const wrapper = mount(ProjectCard, {
      props: { proyecto: mockProyecto },
      global: {
        stubs: { RouterLink: RouterLinkStub },
      },
    });
    expect(wrapper.find('.badge').classes()).toContain('bg-success');
    expect(wrapper.find('.badge').text()).toContain('Activo');
  });

  it('applies correct badge class for inactive project', () => {
    const inactiveProyecto = { ...mockProyecto, proyecto_activo: false };
    const wrapper = mount(ProjectCard, {
      props: { proyecto: inactiveProyecto },
      global: {
        stubs: { RouterLink: RouterLinkStub },
      },
    });
    expect(wrapper.find('.badge').classes()).toContain('bg-danger');
    expect(wrapper.find('.badge').text()).toContain('Inactivo');
  });

  it('emits \'edit\' event when edit button is clicked', async () => {
    const wrapper = mount(ProjectCard, {
      props: { proyecto: mockProyecto },
      global: {
        stubs: { RouterLink: RouterLinkStub },
      },
    });
    await wrapper.find('.btn-warning').trigger('click');
    expect(wrapper.emitted().edit).toBeTruthy();
    expect(wrapper.emitted().edit[0][0]).toEqual(mockProyecto);
  });

  it('emits \'delete\' event when delete button is clicked', async () => {
    const wrapper = mount(ProjectCard, {
      props: { proyecto: mockProyecto },
      global: {
        stubs: { RouterLink: RouterLinkStub },
      },
    });
    await wrapper.find('.btn-danger').trigger('click');
    expect(wrapper.emitted().delete).toBeTruthy();
    expect(wrapper.emitted().delete[0][0]).toEqual(mockProyecto.id);
  });

  it('RouterLink has correct path', () => {
    const wrapper = mount(ProjectCard, {
      props: { proyecto: mockProyecto },
      global: {
        stubs: { RouterLink: RouterLinkStub },
      },
    });
    const routerLink = wrapper.findComponent(RouterLinkStub);
    expect(routerLink.props().to).toEqual({ name: 'project-detail', params: { id: mockProyecto.id } });
  });
});