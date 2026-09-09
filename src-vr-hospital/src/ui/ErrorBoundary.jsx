import { Component } from 'react'

/**
 * Keeps a failure in the 3D tree from blanking the page.
 *
 * A single missing texture used to throw during render and take the whole site
 * with it. Anything that goes wrong in the WebGL layer now falls back to the
 * 2D version, which needs nothing but the photographs.
 */
export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    // Worth seeing in the console; not worth showing a visitor.
    console.error('3D experience failed, falling back to the 2D version:', error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
