"use client"

import * as React from "react"
import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  CheckCircle,
  MessageSquare,
  Users,
  Zap,
  BarChart3,
  Shield,
  Clock,
  Star,
  Play,
  Menu,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const router = useRouter()

  useEffect(() => {
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/95 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  NeXus
                </h1>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-zinc-300 hover:text-white transition-colors">
                  Recursos
                </a>
                <a href="#pricing" className="text-zinc-300 hover:text-white transition-colors">
                  Preços
                </a>
                <a href="#testimonials" className="text-zinc-300 hover:text-white transition-colors">
                  Depoimentos
                </a>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                  >
                    Entrar
                  </Button>
                </Link>
              </div>
            </div>

            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black/95 backdrop-blur-xl border-b border-zinc-800/50">
              <a href="#features" className="block px-3 py-2 text-zinc-300 hover:text-white">
                Recursos
              </a>
              <a href="#pricing" className="block px-3 py-2 text-zinc-300 hover:text-white">
                Preços
              </a>
              <a href="#testimonials" className="block px-3 py-2 text-zinc-300 hover:text-white">
                Depoimentos
              </a>
              <Link href="/dashboard" className="block px-3 py-2">
                <Button variant="outline" className="w-full border-emerald-500/50 text-emerald-400 bg-emerald-500/10">
                  Entrar
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-4 py-2">
            🚀 Revolucione seu WhatsApp Business
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent leading-tight">
            Automatize seu
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              WhatsApp Business
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Gerencie múltiplas instâncias, envie campanhas em massa e aumente suas vendas com a plataforma mais avançada
            do mercado.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-semibold px-8 py-4 text-lg shadow-lg shadow-emerald-500/25"
            >
              Começar Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-zinc-700 bg-zinc-900/50 text-white hover:bg-zinc-800 px-8 py-4 text-lg"
            >
              <Play className="mr-2 h-5 w-5" />
              Ver Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-2">10K+</div>
              <div className="text-zinc-400">Empresas Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">50M+</div>
              <div className="text-zinc-400">Mensagens Enviadas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-2">99.9%</div>
              <div className="text-zinc-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">24/7</div>
              <div className="text-zinc-400">Suporte</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Recursos Poderosos
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Tudo que você precisa para transformar seu WhatsApp em uma máquina de vendas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20 hover:shadow-emerald-500/10 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6 text-emerald-400" />
                </div>
                <CardTitle className="text-white text-xl">Múltiplas Instâncias</CardTitle>
                <CardDescription className="text-zinc-400">
                  Gerencie várias contas WhatsApp Business em uma única plataforma
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20 hover:shadow-cyan-500/10 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-cyan-400" />
                </div>
                <CardTitle className="text-white text-xl">Disparo em Massa</CardTitle>
                <CardDescription className="text-zinc-400">
                  Envie campanhas personalizadas para milhares de contatos simultaneamente
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20 hover:shadow-blue-500/10 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle className="text-white text-xl">Analytics Avançado</CardTitle>
                <CardDescription className="text-zinc-400">
                  Relatórios detalhados sobre performance e engajamento das campanhas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20 hover:shadow-purple-500/10 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-white text-xl">Automação Inteligente</CardTitle>
                <CardDescription className="text-zinc-400">
                  Respostas automáticas e fluxos de conversa personalizados
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20 hover:shadow-green-500/10 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <CardTitle className="text-white text-xl">Segurança Total</CardTitle>
                <CardDescription className="text-zinc-400">
                  Criptografia end-to-end e conformidade com LGPD
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20 hover:shadow-orange-500/10 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-orange-400" />
                </div>
                <CardTitle className="text-white text-xl">Agendamento</CardTitle>
                <CardDescription className="text-zinc-400">
                  Programe campanhas para o momento ideal de engajamento
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Planos Flexíveis
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Escolha o plano ideal para o tamanho do seu negócio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20 relative">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-white text-2xl mb-2">Starter</CardTitle>
                <CardDescription className="text-zinc-400 mb-6">Perfeito para começar</CardDescription>
                <div className="text-4xl font-bold text-white mb-2">
                  R$ 97<span className="text-lg text-zinc-400">/mês</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-zinc-300">1 Instância WhatsApp</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-zinc-300">Até 1.000 contatos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-zinc-300">5.000 mensagens/mês</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-zinc-300">Suporte por email</span>
                </div>
                <Button className="w-full mt-8 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-semibold">
                  Começar Agora
                </Button>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-emerald-500/50 shadow-xl shadow-emerald-500/20 relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold px-4 py-1">
                  Mais Popular
                </Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-white text-2xl mb-2">Professional</CardTitle>
                <CardDescription className="text-zinc-400 mb-6">Para empresas em crescimento</CardDescription>
                <div className="text-4xl font-bold text-white mb-2">
                  R$ 297<span className="text-lg text-zinc-400">/mês</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-zinc-300">5 Instâncias WhatsApp</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-zinc-300">Até 10.000 contatos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-zinc-300">50.000 mensagens/mês</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-zinc-300">Automação avançada</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-zinc-300">Suporte prioritário</span>
                </div>
                <Button className="w-full mt-8 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-semibold">
                  Começar Agora
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20 relative">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-white text-2xl mb-2">Enterprise</CardTitle>
                <CardDescription className="text-zinc-400 mb-6">Para grandes operações</CardDescription>
                <div className="text-4xl font-bold text-white mb-2">
                  R$ 697<span className="text-lg text-zinc-400">/mês</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-zinc-300">Instâncias ilimitadas</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-zinc-300">Contatos ilimitados</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-zinc-300">Mensagens ilimitadas</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-zinc-300">API personalizada</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-zinc-300">Suporte 24/7</span>
                </div>
                <Button className="w-full mt-8 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-semibold">
                  Falar com Vendas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-zinc-950 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Mais de 10.000 empresas confiam no NeXus para suas estratégias de WhatsApp
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-zinc-300 mb-6">
                  "O NeXus revolucionou nossa estratégia de vendas. Aumentamos nossa conversão em 300% no primeiro mês!"
                </p>
                <div className="flex items-center">
                  <Avatar className="w-12 h-12 mr-4">
                    <AvatarImage src="/placeholder.svg?height=48&width=48&text=MC" />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-400 text-black font-bold">
                      MC
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-white font-semibold">Maria Clara</div>
                    <div className="text-zinc-400 text-sm">CEO, TechStart</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-zinc-300 mb-6">
                  "Interface intuitiva e recursos poderosos. Nossa equipe de vendas nunca foi tão produtiva!"
                </p>
                <div className="flex items-center">
                  <Avatar className="w-12 h-12 mr-4">
                    <AvatarImage src="/placeholder.svg?height=48&width=48&text=RS" />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-400 text-black font-bold">
                      RS
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-white font-semibold">Roberto Silva</div>
                    <div className="text-zinc-400 text-sm">Diretor Comercial, VendaMais</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-zinc-300 mb-6">
                  "Suporte excepcional e plataforma estável. Recomendo para qualquer empresa séria sobre WhatsApp."
                </p>
                <div className="flex items-center">
                  <Avatar className="w-12 h-12 mr-4">
                    <AvatarImage src="/placeholder.svg?height=48&width=48&text=AL" />
                    <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-black font-bold">
                      AL
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-white font-semibold">Ana Luiza</div>
                    <div className="text-zinc-400 text-sm">Fundadora, DigitalPro</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Pronto para revolucionar suas vendas?
          </h2>
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
            Junte-se a milhares de empresas que já transformaram seus resultados com o NeXus
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-semibold px-8 py-4 text-lg shadow-lg shadow-emerald-500/25"
            >
              Começar Teste Gratuito
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-zinc-500 text-sm">✅ 14 dias grátis • ✅ Sem cartão de crédito • ✅ Suporte incluído</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                NeXus
              </h3>
              <p className="text-zinc-400 mb-6 max-w-md">
                A plataforma mais avançada para automação e gestão do WhatsApp Business. Transforme conversas em vendas.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                  Termos de Uso
                </Button>
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                  Privacidade
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Produto</h4>
              <div className="space-y-2">
                <a href="#features" className="block text-zinc-400 hover:text-white transition-colors">
                  Recursos
                </a>
                <a href="#pricing" className="block text-zinc-400 hover:text-white transition-colors">
                  Preços
                </a>
                <a href="#" className="block text-zinc-400 hover:text-white transition-colors">
                  API
                </a>
                <a href="#" className="block text-zinc-400 hover:text-white transition-colors">
                  Integrações
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Suporte</h4>
              <div className="space-y-2">
                <a href="#" className="block text-zinc-400 hover:text-white transition-colors">
                  Central de Ajuda
                </a>
                <a href="#" className="block text-zinc-400 hover:text-white transition-colors">
                  Contato
                </a>
                <a href="#" className="block text-zinc-400 hover:text-white transition-colors">
                  Status
                </a>
                <Link href="/dashboard" className="block text-emerald-400 hover:text-emerald-300 transition-colors">
                  Acessar Dashboard
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800/50 mt-12 pt-8 text-center">
            <p className="text-zinc-400">
              © 2024 NeXus. Todos os direitos reservados. Feito com ❤️ para revolucionar o WhatsApp Business.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
