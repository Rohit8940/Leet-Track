import { SignIn, SignUp } from '@clerk/clerk-react'
import { useMemo } from 'react'
import './AuthLayout.css'

const appearanceOptions = {
  layout: {
    socialButtonsVariant: 'iconButton',
    helpPageUrl: '',
    logoImageUrl: '',
    shimmer: true,
  },
  elements: {
    rootBox: {
      width: '100%',
    },
    card: {
      boxShadow: '0 32px 80px rgba(15, 23, 42, 0.45)',
      borderRadius: '28px',
      border: '1px solid rgba(148, 163, 184, 0.35)',
      background: 'linear-gradient(145deg, rgba(17, 25, 40, 0.92), rgba(30, 41, 59, 0.75))',
      backdropFilter: 'blur(22px)',
    },
    headerTitle: {
      fontSize: '28px',
      fontWeight: 700,
      color: '#e2e8f0',
    },
    headerSubtitle: {
      color: 'rgba(226, 232, 240, 0.75)',
      fontSize: '15px',
    },
    socialButtonsIconButton: {
      background: 'rgba(226, 232, 240, 0.14)',
      borderRadius: '14px',
      color: '#f8fafc',
      boxShadow: 'inset 0 0 0 1px rgba(148, 163, 184, 0.4)',
    },
    socialButtonsBlockButton: {
      background: 'rgba(226, 232, 240, 0.14)',
      borderRadius: '14px',
      color: '#f8fafc',
      boxShadow: 'inset 0 0 0 1px rgba(148, 163, 184, 0.4)',
    },
    dividerLine: {
      backgroundColor: 'rgba(148, 163, 184, 0.3)',
    },
    dividerText: {
      color: 'rgba(226, 232, 240, 0.7)',
    },
    formFieldLabel: {
      color: 'rgba(226, 232, 240, 0.8)',
      fontSize: '13px',
      letterSpacing: '0.02em',
    },
    formFieldInput: {
      borderRadius: '14px',
      border: '1px solid rgba(148, 163, 184, 0.45)',
      backgroundColor: 'rgba(15, 23, 42, 0.35)',
      color: '#f8fafc',
    },
    formButtonPrimary: {
      borderRadius: '16px',
      boxShadow:
        '0 18px 35px -16px rgba(124,58,237,0.65), inset 0 0 0 1px rgba(192, 132, 252, 0.35)',
      background:
        'linear-gradient(135deg, rgba(99, 102, 241, 0.95), rgba(168, 85, 247, 0.9), rgba(14, 165, 233, 0.95))',
      color: '#f8fafc',
    },
    formButtonPrimary__loading: {
      background:
        'linear-gradient(135deg, rgba(79, 70, 229, 0.9), rgba(14, 165, 233, 0.9))',
    },
    footerActionText: {
      color: 'rgba(226, 232, 240, 0.7)',
    },
    footerActionLink: {
      color: '#38bdf8',
    },
    footer: {
      borderColor: 'rgba(148, 163, 184, 0.2)',
      background: 'rgba(15, 23, 42, 0.4)',
      borderRadius: '0 0 24px 24px',
    },
  },
}

const AuthLayout = ({ mode }) => {
  const isSignIn = mode === 'sign-in'

  const layoutCopy = useMemo(
    () =>
      isSignIn
        ? {
            title: 'Step back into Leet-Track',
            subtitle: 'Continue your mastery loop with the 3-7-15 cadence.',
          }
        : {
            title: 'Craft your Leet-Track journey',
            subtitle: 'Create an account to track, revisit, and conquer every problem.',
          },
    [isSignIn],
  )

  return (
    <div className="auth-backdrop">
      <div className="auth-orb auth-orb--left" aria-hidden="true" />
      <div className="auth-orb auth-orb--right" aria-hidden="true" />
      <div className="auth-grid" aria-hidden="true" />
      <div className="auth-shell">
        <header className="auth-header">
          <span className="auth-chip">Leet-Track</span>
          <h1>{layoutCopy.title}</h1>
          <p>{layoutCopy.subtitle}</p>
        </header>
        <div className="auth-panel">
          {isSignIn ? (
            <SignIn appearance={appearanceOptions} routing="path" path="/sign-in" signUpUrl="/sign-up" />
          ) : (
            <SignUp appearance={appearanceOptions} routing="path" path="/sign-up" signInUrl="/sign-in" />
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
