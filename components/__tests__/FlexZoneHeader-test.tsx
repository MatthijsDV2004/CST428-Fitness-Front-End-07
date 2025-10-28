import renderer, { act } from 'react-test-renderer';
import FlexZoneHeader from '../FlexZoneHeader';

it('renders correctly', () => {
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<FlexZoneHeader />);
  });

  expect(tree!.toJSON()).toMatchSnapshot();
});

it('contains the correct text', () => {
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<FlexZoneHeader />);
  });

  const json = tree!.toJSON() as any;

  // defensive guards in case structure changes
  expect(json).toBeTruthy();
  expect(json.children?.[0]?.children?.[0]).toBe('FlexZone:');
  expect(json.children?.[1]?.children?.[0]).toBe('the fitness app');
});
