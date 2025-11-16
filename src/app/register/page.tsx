'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar usuario');
      }

      // Registro exitoso, redirigir a signin
      router.push('/signin?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl text-gray-800 font-bold mb-6 text-center">
          Crear Cuenta
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Nombre completo
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaUser className="text-gray-400" />
              </span>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-pink-500 text-gray-800"
                placeholder="Rossy Flores"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaEnvelope className="text-gray-400" />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-pink-500 text-gray-800"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaLock className="text-gray-400" />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-pink-500 text-gray-800"
                placeholder="••••••••"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaLock className="text-gray-400" />
              </span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-pink-500 text-gray-800"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 text-white py-2 px-4 rounded hover:bg-pink-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/signin" className="text-pink-600 hover:text-pink-700 font-semibold">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}