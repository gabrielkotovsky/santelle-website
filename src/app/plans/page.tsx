"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

type GTMEventValue = string | number | boolean | null | undefined;
type GTMEventData = Record<string, GTMEventValue>;
type GTMWindow = Window & {
  dataLayer?: Array<GTMEventData & { event?: string }>;
};

// GTM Event Tracking Helper
const trackGTMEvent = (eventName: string, eventData: GTMEventData) => {
  if (typeof window !== "undefined") {
    const dataLayer = (window as GTMWindow).dataLayer;
    if (dataLayer) {
      dataLayer.push({
        event: eventName,
        ...eventData,
      });
    }
  }
};

const allPlans = [
  {
    name: "Proactive",
    frequency: "Kit mensuel",
    cyclePrice: "12,99 CHF",
    cyclePeriod: "mois",
    annualPrice: "129,99 CHF",
    annualPeriod: "an",
    savingsPercentage: "16,6 %",
    cycleLookupKey: "proactive-monthly",
    annualLookupKey: "proactive-annual",
    originalIndex: 0,
  },
  {
    name: "Balanced",
    frequency: "Kit bimestriel",
    cyclePrice: "16,99 CHF",
    cyclePeriod: "2 mois",
    annualPrice: "79,99 CHF",
    annualPeriod: "an",
    savingsPercentage: "21,5 %",
    cycleLookupKey: "balanced-bimonthly",
    annualLookupKey: "balanced-annual",
    originalIndex: 1,
  },
  {
    name: "Essential",
    frequency: "Kit trimestriel",
    cyclePrice: "19,99 CHF",
    cyclePeriod: "3 mois",
    annualPrice: "59,99 CHF",
    annualPeriod: "an",
    savingsPercentage: "25,0 %",
    cycleLookupKey: "essential-quarterly",
    annualLookupKey: "essential-annual",
    originalIndex: 2,
  },
  {
    name: "One-Off",
    frequency: "Kit à l’unité",
    cyclePrice: "24,99 CHF",
    cyclePeriod: "achat unique",
    annualPrice: null,
    annualPeriod: null,
    savingsPercentage: null,
    cycleLookupKey: "1pack",
    annualLookupKey: null,
    originalIndex: 3,
  },
];

const commonFeatures = [
  "Accès illimité à l’app Santelle et à la communauté - ton espace d’échange, d’apprentissage et de soutien.",
  "Suivi intelligent de ton équilibre intime avec des recommandations personnalisées à chaque test",
  "Contenus exclusifs : conseils d’expertes, ressources éducatives et rappels adaptés à ton profil",
  "-30 % sur les kits supplémentaires",
];

const kitContents = [
  "Un écouvillon pour prélever la sécrétion",
  {
    main: "Un test multi-biomarqueurs qui indique si tes résultats sont compatibles avec:",
    subItems: [
      "une mycose",
      "⁠une vaginose",
      "⁠une infection aérobie",
      "⁠une inflammation ou une irritation",
      "⁠un déséquilibre de la flore protectrice"
    ],
  },
];

const appFeatures = [
  "Analyse instantanée de ton test",
  "Interprétation simple avec des explications visuelles",
  "Recommandations personnalisées selon ton profil",
  "Suivi dans le temps pour repérer les changements tôt",
  "Contenus éducatifs courts pour comprendre ton corps",
];

function PlansContent() {
  const searchParams = useSearchParams();
  const recommendedParam = searchParams.get("recommended");
  const recommendedPlanIndex = recommendedParam
    ? parseInt(recommendedParam)
    : null;
  const { user } = useAuth();

  // Check for success/cancel from Stripe redirect
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");
  const sessionId = searchParams.get("session_id");

  // Detect if on mobile device
  const [isMobile, setIsMobile] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Waitlist form state
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [isSubmittingWaitlist, setIsSubmittingWaitlist] = useState(false);
  const [waitlistStatus, setWaitlistStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // Handle checkout - go directly to checkout without auth requirement
  const initiateCheckout = async (
    lookupKeyParam: string,
    planParam: (typeof allPlans)[0],
    billingPeriodParam: "cycle" | "one_time"
  ) => {
    trackGTMEvent("Plan_Checkout_Initiated", {
      plan_name: planParam.name,
      billing_type:
        billingPeriodParam === "one_time" ? "one_time" : "per_cycle",
      lookup_key: lookupKeyParam,
      is_recommended:
        recommendedPlanIndex !== null &&
        planParam.originalIndex === recommendedPlanIndex,
    });

    setIsRedirecting(true);

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/.netlify/functions/create-checkout-session";

    const inputLookup = document.createElement("input");
    inputLookup.type = "hidden";
    inputLookup.name = "lookup_key";
    inputLookup.value = lookupKeyParam;

    // Include user_id and email if user is authenticated
    if (user && user.email && user.id) {
      const inputUid = document.createElement("input");
      inputUid.type = "hidden";
      inputUid.name = "user_id";
      inputUid.value = user.id;

      const inputEmail = document.createElement("input");
      inputEmail.type = "hidden";
      inputEmail.name = "email";
      inputEmail.value = user.email;

      form.appendChild(inputUid);
      form.appendChild(inputEmail);
    }

    form.appendChild(inputLookup);
    document.body.appendChild(form);
    form.submit();
  };

  const handlePreOrder = async (plan: (typeof allPlans)[0]) => {
    const isOneOff = plan.cycleLookupKey === "1pack";
    trackGTMEvent("plan_selected", {
      plan_name: plan.name,
      billing_type: isOneOff ? "one_time" : "per_cycle",
      is_recommended:
        recommendedPlanIndex !== null &&
        plan.originalIndex === recommendedPlanIndex,
    });
    const billingPeriod = isOneOff ? "one_time" : "cycle";
    await initiateCheckout(plan.cycleLookupKey, plan, billingPeriod);
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!waitlistEmail || isSubmittingWaitlist) {
      return;
    }

    setIsSubmittingWaitlist(true);
    setWaitlistStatus("idle");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: waitlistEmail }),
      });

      if (!response.ok) {
        throw new Error("Failed to join waitlist");
      }

      trackGTMEvent("Waitlist_Signed_Up", {
        source: "plans_page",
        email_provided: true,
      });

      setWaitlistStatus("success");
      setWaitlistEmail("");
    } catch (error) {
      console.error("Waitlist submission error:", error);
      setWaitlistStatus("error");
    } finally {
      setIsSubmittingWaitlist(false);
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // On mobile, sort plans to show recommended first; on desktop, keep original order
  const sortedPlans =
    isMobile && recommendedPlanIndex !== null
      ? [...allPlans].sort((a, b) => {
          if (a.originalIndex === recommendedPlanIndex) return -1;
          if (b.originalIndex === recommendedPlanIndex) return 1;
          return a.originalIndex - b.originalIndex;
        })
      : allPlans;

  const proactivePlan =
    sortedPlans.find((plan) => plan.cycleLookupKey === "proactive-monthly") ||
    null;
  const oneOffPlan =
    sortedPlans.find((plan) => plan.cycleLookupKey === "1pack") || null;

  const basePlans: typeof allPlans = [];
  if (proactivePlan) {
    basePlans.push(proactivePlan);
  }
  if (oneOffPlan) {
    basePlans.push(oneOffPlan);
  }

  const displayedPlans = basePlans;

  // State for checkout success handling
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [checkoutTracked, setCheckoutTracked] = useState(false);
  const [cancelTracked, setCancelTracked] = useState(false);

  // Handle successful checkout - fetch details and track event
  useEffect(() => {
    if (success && sessionId && !checkoutTracked) {
      setDetailsLoading(true);
      setDetailsError("");

      // Track checkout success immediately
      trackGTMEvent("Checkout_Success", {
        session_id: sessionId,
        timestamp: new Date().toISOString(),
      });

      // Fetch session details to get plan information
      fetch(`/api/stripe/session-details?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          // Track checkout success with plan details
          if (data.plan_lookup_key) {
            // Determine plan name and billing type from lookup key
            const plan = allPlans.find(
              (p) =>
                p.cycleLookupKey === data.plan_lookup_key ||
                p.annualLookupKey === data.plan_lookup_key
            );
            const isAnnual = plan?.annualLookupKey === data.plan_lookup_key;

            trackGTMEvent("Checkout_Success_Complete", {
              session_id: sessionId,
              plan_name: plan?.name || "unknown",
              billing_type: isAnnual ? "annual" : "per_cycle",
              lookup_key: data.plan_lookup_key,
              subscription_id: data.subscription_id || null,
              customer_id: data.stripe_customer_id || null,
            });
          }
          setCheckoutTracked(true);
        })
        .catch((err: unknown) => {
          const message =
            err instanceof Error ? err.message : "Failed to upsert profile.";
          setDetailsError(message);
          // Still mark as tracked to avoid duplicate events
          setCheckoutTracked(true);
        })
        .finally(() => setDetailsLoading(false));
    }
  }, [success, sessionId, checkoutTracked]);

  // Handle canceled checkout - track event
  useEffect(() => {
    if (canceled && !cancelTracked) {
      // Track checkout cancellation
      trackGTMEvent("Checkout_Canceled", {
        timestamp: new Date().toISOString(),
        canceled_at: new Date().toISOString(),
      });
      setCancelTracked(true);
    }
  }, [canceled, cancelTracked]);

  // Show success message if payment was successful
  if (success && sessionId) {
    return (
      <main className="relative min-h-[100svh] flex items-center justify-center">
        {/* Background - Video for Desktop, Image for Mobile */}
        <div className="fixed inset-0 -z-10 flex items-center justify-center">
          <video
            src="/background_desktop.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover hidden md:block"
            style={{
              objectFit: "cover",
              objectPosition: "center",
              width: "100vw",
              height: "100dvh",
            }}
          />
          <div
            className="absolute inset-0 w-full h-full block md:hidden"
            style={{
              backgroundImage: "url(/background-mobile.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundAttachment: "scroll",
              width: "100vw",
              height: "100svh",
            }}
          />
          <div className="bg-white/30 absolute inset-0 backdrop-blur-lg" />
        </div>

        <div className="relative z-10 w-[95%] max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white/40 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/50">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl md:text-3xl font-bold text-[#721422] mb-4">
                Abonnement confirmé !
              </h3>
              <p className="text-lg text-[#721422]/80 mb-6">
                Bienvenue chez Santelle ! Vous allez recevoir un e-mail de
                confirmation sous peu.
              </p>
              {detailsLoading && (
                <p className="text-[#721422]">
                  Finalisation de votre abonnement…
                </p>
              )}
              {detailsError && <p className="text-red-600">{detailsError}</p>}
            </div>

            <a
              href="https://billing.stripe.com/p/login/00wdRaaLq2nT2Nv9lqcAo00"
              className="block w-full bg-[#721422] text-white font-bold px-8 py-4 rounded-full hover:bg-[#8a1a2a] transition-colors duration-200 text-center"
              rel="noopener noreferrer"
              target="_blank"
            >
              Gérer mon compte
            </a>
          </div>
        </div>
      </main>
    );
  }

  // Show cancel message if payment was canceled
  if (canceled) {
    return (
      <main className="relative min-h-[100svh] flex items-center justify-center">
        {/* Background - Video for Desktop, Image for Mobile */}
        <div className="fixed inset-0 -z-10 flex items-center justify-center">
          <video
            src="/background_desktop.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover hidden md:block"
            style={{
              objectFit: "cover",
              objectPosition: "center",
              width: "100vw",
              height: "100dvh",
            }}
          />
          <div
            className="absolute inset-0 w-full h-full block md:hidden"
            style={{
              backgroundImage: "url(/background-mobile.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundAttachment: "scroll",
              width: "100vw",
              height: "100svh",
            }}
          />
          <div className="bg-white/30 absolute inset-0 backdrop-blur-lg" />
        </div>

        <div className="relative z-10 w-[95%] max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white/40 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/50">
            <div className="text-center">
              <p className="text-xl text-[#721422] mb-6">
                Commande annulée — poursuivez votre visite et revenez lorsque
                vous serez prête.
              </p>
            </div>

            <div className="text-center">
              <a
                href="/plans"
                className="inline-block bg-[#721422] text-white font-bold px-8 py-4 rounded-full hover:bg-[#8a1a2a] transition-colors duration-200"
              >
                Retour aux offres
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100svh] flex items-center justify-center">
      {/* Background - Video for Desktop, Image for Mobile */}
      <div className="fixed inset-0 -z-10 flex items-center justify-center overflow-hidden">
        {/* Desktop Video Background */}
        <video
          src="/background_desktop.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover hidden md:block"
          style={{
            objectFit: "cover",
            objectPosition: "center",
            width: "100vw",
            height: "100dvh",
          }}
        />

        {/* Mobile Background Image */}
        <div
          className="absolute inset-0 w-full h-full block md:hidden"
          style={{
            backgroundImage: "url(/background-mobile.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "scroll",
            width: "100vw",
            height: "100svh",
          }}
        />

        {/* Overlay - Blur only, no color */}
        <div className="bg-white/30 absolute inset-0 backdrop-blur-lg" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-[95%] mx-auto px-1 sm:px-4 py-10">
        <div className="mb-6 text-center">
          <a
            href="https://santellehealth.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white/60 backdrop-blur-sm text-[#721422] font-semibold px-4 py-2 rounded-full hover:bg-white/80 transition-all duration-200 border border-[#721422]/30"
          >
            ← Accueil
          </a>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-[#721422] mb-10 text-center">
          {recommendedPlanIndex !== null
            ? "Selon vos réponses, cette offre vous aide à rester équilibrée et sereine."
            : "Choisissez l'offre qui correspond le mieux à vos besoins."}
        </h1>

        <div className="flex flex-col gap-4 sm:gap-8 max-w-7xl mx-auto">
          {/* Plan Cards */}
          <div
            className={`grid gap-1 sm:gap-6 ${
              displayedPlans.length === 1
                ? "grid-cols-1 max-w-2xl mx-auto"
                : displayedPlans.length === 2
                  ? "grid-cols-2 max-w-4xl mx-auto"
                  : "grid-cols-2 md:grid-cols-4"
            }`}
          >
            {displayedPlans.map((plan) => {
              const isOneOff = plan.cycleLookupKey === "1pack";

              // Define features for each plan
              const monthlyFeatures = [
                "Kit livré chaque mois",
                "Compagnon AI 24/7",
                "Contenus exclusifs",
                "Espace communauté & soutien personnalisé",
                "–30% sur les kits supplémentaires",
                "Accès illimité à l'app Santelle",
                "Recommandations personnalisées",
              ];

              const oneOffFeatures = [
                "Analyse de 6 biomarqueurs",
                "Sans engagement",
                "Détection de 4 types d'infections",
                "Lecture instantanée (patient artificiel)",
                "Conseils adaptés à vos résultats",
              ];

              const features = isOneOff ? oneOffFeatures : monthlyFeatures;

              return (
                <div
                  key={plan.name}
                  className={`rounded-[30px] overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 flex flex-col ${
                    isOneOff ? "bg-[#fbeeef]" : "bg-[#e86d79]"
                  }`}
                  style={{ position: "relative" }}
                >
                  {/* Kit Image at top */}
                  <div className="relative h-[180px] sm:h-[250px] flex items-center justify-center pt-6">
                    <Image
                      src={isOneOff ? "/one-shot.png" : "/subscription.png"}
                      alt={
                        isOneOff
                          ? "Santelle Kit - Achat unique"
                          : "Santelle Kit - Abonnement mensuel"
                      }
                      width={150}
                      height={150}
                      className="object-contain"
                      style={{ maxHeight: "200px", width: "auto" }}
                    />
                  </div>

                  {/* Content */}
                  <div className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 flex flex-col gap-4 sm:gap-5 md:gap-6 flex-1">
                    {/* Title and Subtitle */}
                    <div className="text-center">
                      <h2
                        className={`text-sm sm:text-base md:text-lg lg:text-xl font-medium mb-1.5 sm:mb-2 ${isOneOff ? "text-black" : "text-white"}`}
                      >
                        {isOneOff
                          ? "Kit en achat unique"
                          : "Abonnement mensuel"}
                      </h2>
                      <p
                        className={`text-[10px] sm:text-xs md:text-sm ${isOneOff ? "text-slate-600" : "text-white"}`}
                      >
                        {isOneOff
                          ? "Un test, une réponse claire."
                          : "Votre suivi complet, chaque mois."}
                      </p>
                    </div>

                    {/* Price */}
                    <div
                      className={`text-center ${isOneOff ? "text-[#721423]" : "text-white"}`}
                    >
                      <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium">
                        CHF {isOneOff ? "24,99" : "12,99"}
                      </span>
                      <span className="text-xs sm:text-sm md:text-base lg:text-lg font-light ml-1 sm:ml-2">
                        /{isOneOff ? "le kit" : "mois"}
                      </span>
                    </div>

                    {/* Separator line */}
                    <div className="w-full h-px bg-white/20" />

                    {/* Features */}
                    <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-2.5 items-center">
                      {features.map((feature, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 sm:gap-2.5 md:gap-3 px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 rounded-full ${
                            isOneOff
                              ? "bg-[rgba(232,109,121,0.1)]"
                              : "bg-white/10"
                          }`}
                        >
                          <div
                            className={`flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 rounded-lg sm:rounded-xl flex items-center justify-center ${
                              isOneOff ? "bg-black/5" : "bg-white"
                            }`}
                          >
                            <svg
                              width="8"
                              height="6"
                              viewBox="0 0 10 8"
                              fill="none"
                              className={
                                isOneOff ? "text-[#e86d79]" : "text-[#e86d79]"
                              }
                            >
                              <path
                                d="M1 4L3.5 6.5L9 1"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <span
                            className={`text-[10px] sm:text-xs md:text-sm font-medium ${
                              isOneOff ? "text-[#721423]" : "text-white"
                            }`}
                          >
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handlePreOrder(plan)}
                      className={`mt-auto w-full py-2.5 sm:py-3 md:py-4 px-4 sm:px-6 md:px-8 rounded-full font-semibold text-[10px] sm:text-xs md:text-sm transition-colors duration-200 ${
                        isOneOff
                          ? "bg-[#721423] text-white hover:bg-[#8a1a2a]"
                          : "bg-white text-[#721423] hover:bg-white/90"
                      }`}
                    >
                      {isOneOff ? "Acheter un kit" : "Je veux essayer Santelle"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Waitlist Section */}
          <div className="flex justify-center">
            <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/50 max-w-2xl w-full">
              <div className="text-center mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-[#721422] mb-2">
                  Ou rejoignez la newsletter
                </h3>
                <p className="text-[#721422]/80 text-sm md:text-base">
                  Pour rester informée
                </p>
              </div>

              {waitlistStatus === "success" ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-[#721422] font-semibold">
                    Merci ! Vous êtes sur la liste d&apos;attente.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleWaitlistSubmit}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <input
                    type="email"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="Votre adresse e-mail"
                    required
                    disabled={isSubmittingWaitlist}
                    className="flex-1 px-4 py-3 rounded-full border-2 border-[#721422]/30 bg-white/50 text-[#721422] placeholder-[#721422]/40 focus:outline-none focus:ring-2 focus:ring-[#721422] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingWaitlist || !waitlistEmail}
                    className="bg-[#721422] text-white font-bold px-6 py-3 rounded-full hover:bg-[#8a1a2a] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isSubmittingWaitlist ? "Envoi..." : "Rejoindre"}
                  </button>
                </form>
              )}

              {waitlistStatus === "error" && (
                <p className="text-red-600 text-sm text-center mt-3">
                  Une erreur s&apos;est produite. Veuillez réessayer.
                </p>
              )}
            </div>
          </div>

          {/* Pre-Order Features and Common Features - Below Plan Cards */}
          <div className="flex flex-col gap-6">
            {/* First Row: Pre-Order Benefits and All Plans Include */}
            <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
              {/* Pre-Order Features Card */}

              {/* Common Features Card */}
              <div className="flex justify-center w-full">
                <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 border border-white/50 max-w-2xl w-full">
                  <h3 className="text-xl font-bold text-[#721422] mb-4 text-center">
                    Avantages de l&apos;abonnement
                  </h3>
                  <ul className="flex flex-col gap-4 justify-center">
                    {commonFeatures.map((feature, idx) => (
                      <li key={idx} className="text-[#721422] flex items-center">
                        <span className="mr-2 text-lg">✓</span>
                        <span className="text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Second Row: Kit Features Card */}
            <div className="flex justify-center">
              <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 border border-white/50 max-w-2xl w-full">
                <div className="text-center">
                  <button
                    onClick={() => {
                      const details = document.getElementById("kit-details");
                      const arrow = document.getElementById("kit-expand-arrow");
                      if (details && arrow) {
                        const isExpanded =
                          details.classList.contains("expanded");

                        if (isExpanded) {
                          // Collapse
                          details.style.maxHeight = "0px";
                          details.style.opacity = "0";
                          details.classList.remove("expanded");
                          arrow.style.transform = "rotate(0deg)";
                        } else {
                          // Expand
                          details.style.maxHeight = details.scrollHeight + "px";
                          details.style.opacity = "1";
                          details.classList.add("expanded");
                          arrow.style.transform = "rotate(180deg)";
                        }
                      }
                    }}
                    className="flex items-center justify-center gap-2 text-[#721422] hover:text-[#8a1a2a] transition-colors duration-200 mx-auto mb-0"
                  >
                    <h3 className="text-xl font-bold text-[#721422]">
                      Que contient le kit ?
                    </h3>
                    <svg
                      id="kit-expand-arrow"
                      className="w-5 h-5 transition-transform duration-300 ease-in-out"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>

                <div
                  id="kit-details"
                  className="overflow-hidden transition-all duration-500 ease-in-out"
                  style={{
                    maxHeight: "0px",
                    opacity: "0",
                    transform: "translateY(-10px)",
                  }}
                >
                  <div className="pt-4 space-y-6">
                    {/* Kit Contents Section */}
                    <div>
                      <h4 className="font-semibold text-lg mb-3 text-[#721422]">
                        Kit Santelle :
                      </h4>
                      <ul className="flex flex-col gap-4 justify-center">
                        {kitContents.map((content, idx) => {
                          const isObject = typeof content === "object";
                          const mainText = isObject ? content.main : content;
                          const subItems = isObject ? content.subItems : null;

                          return (
                            <li key={idx} className="text-[#721422]">
                              <div className="flex items-center">
                                <span className="mr-2 text-lg">✓</span>
                                <span className="text-base">{mainText}</span>
                              </div>
                              {subItems && (
                                <ul className="ml-6 mt-2 flex flex-col gap-2">
                                  {subItems.map((subItem, subIdx) => (
                                    <li
                                      key={subIdx}
                                      className="text-[#721422] flex items-center"
                                    >
                                      <span className="mr-2 text-sm">•</span>
                                      <span className="text-sm">{subItem}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* App Features Section */}
                    <div>
                      <h4 className="font-semibold text-lg mb-3 text-[#721422]">
                        Fonctionnalités de l’app :
                      </h4>
                      <ul className="flex flex-col gap-4 justify-center">
                        {appFeatures.map((feature, idx) => (
                          <li
                            key={idx}
                            className="text-[#721422] flex items-center"
                          >
                            <span className="mr-2 text-lg">✓</span>
                            <span className="text-base">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isRedirecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#721422] border-t-transparent" />
            <p className="mt-4 text-base font-semibold text-[#721422]">
              Redirection vers le paiement sécurisé…
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

export default function PlansPage() {
  return (
    <Suspense
      fallback={
        <main className="relative min-h-[100svh] flex items-center justify-center">
          <div className="fixed inset-0 -z-10 flex items-center justify-center">
            <video
              src="/background_desktop.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover hidden md:block"
              style={{
                objectFit: "cover",
                objectPosition: "center",
                width: "100vw",
                height: "100dvh",
              }}
            />
            <div
              className="absolute inset-0 w-full h-full block md:hidden"
              style={{
                backgroundImage: "url(/background-mobile.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "scroll",
                width: "100vw",
                height: "100svh",
              }}
            />
            <div className="bg-white/30 absolute inset-0 backdrop-blur-lg" />
          </div>
          <div className="relative z-10 text-[#721422] text-xl">
            Chargement…
          </div>
        </main>
      }
    >
      <PlansContent />
    </Suspense>
  );
}
