--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AttendanceStatus; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public."AttendanceStatus" AS ENUM (
    'PRESENT',
    'LATE',
    'ABSENT'
);


ALTER TYPE public."AttendanceStatus" OWNER TO "user";

--
-- Name: CommissionType; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public."CommissionType" AS ENUM (
    'SERVICE',
    'RETAIL'
);


ALTER TYPE public."CommissionType" OWNER TO "user";

--
-- Name: CustomerJourneyState; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public."CustomerJourneyState" AS ENUM (
    'AWARENESS',
    'CONSIDERATION',
    'BOOKING',
    'IN_SALON',
    'POST_SERVICE',
    'RETENTION'
);


ALTER TYPE public."CustomerJourneyState" OWNER TO "user";

--
-- Name: LoyaltyTierName; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public."LoyaltyTierName" AS ENUM (
    'SILVER',
    'GOLD',
    'PLATINUM',
    'DIAMOND'
);


ALTER TYPE public."LoyaltyTierName" OWNER TO "user";

--
-- Name: NotificationStatus; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public."NotificationStatus" AS ENUM (
    'UNREAD',
    'READ'
);


ALTER TYPE public."NotificationStatus" OWNER TO "user";

--
-- Name: SalaryStatus; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public."SalaryStatus" AS ENUM (
    'PENDING',
    'PAID'
);


ALTER TYPE public."SalaryStatus" OWNER TO "user";

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'MANAGER',
    'RECEPTIONIST',
    'STYLIST',
    'ASSISTANT'
);


ALTER TYPE public."UserRole" OWNER TO "user";

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AbandonedCart; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."AbandonedCart" (
    id text NOT NULL,
    "customerId" text,
    phone text,
    "abandonmentType" text NOT NULL,
    "originalIntent" text,
    "recoveryAttempts" integer DEFAULT 0 NOT NULL,
    "lastAttempt" timestamp(3) without time zone,
    "nextAttempt" timestamp(3) without time zone,
    status text DEFAULT 'ABANDONED'::text NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AbandonedCart" OWNER TO "user";

--
-- Name: AutomationFlow; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."AutomationFlow" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    trigger text NOT NULL,
    conditions jsonb NOT NULL,
    actions jsonb NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AutomationFlow" OWNER TO "user";

--
-- Name: AutomationLog; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."AutomationLog" (
    id text NOT NULL,
    "flowId" text NOT NULL,
    "customerId" text NOT NULL,
    action text NOT NULL,
    result text NOT NULL,
    metadata jsonb,
    error text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AutomationLog" OWNER TO "user";

--
-- Name: Booking; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Booking" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "branchId" text NOT NULL,
    "stylistId" text,
    "serviceId" text,
    date timestamp(3) without time zone NOT NULL,
    status text NOT NULL,
    notes text
);


ALTER TABLE public."Booking" OWNER TO "user";

--
-- Name: Branch; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Branch" (
    id text NOT NULL,
    "partnerId" text,
    name text NOT NULL,
    code text,
    address text,
    phone text,
    email text,
    "managerId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    timezone text DEFAULT 'Asia/Ho_Chi_Minh'::text,
    currency text DEFAULT 'VND'::text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Branch" OWNER TO "user";

--
-- Name: BranchForecast; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."BranchForecast" (
    id text NOT NULL,
    "branchId" text NOT NULL,
    "forecastDate" timestamp(3) without time zone NOT NULL,
    "forecastType" text NOT NULL,
    "predictedValue" double precision,
    confidence double precision,
    factors jsonb,
    "aiAnalysis" text,
    recommendations text[],
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."BranchForecast" OWNER TO "user";

--
-- Name: BranchInventory; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."BranchInventory" (
    id text NOT NULL,
    "branchId" text NOT NULL,
    "productId" text NOT NULL,
    stock double precision DEFAULT 0 NOT NULL,
    "reservedStock" double precision DEFAULT 0 NOT NULL,
    "safetyStock" double precision,
    "reorderPoint" double precision,
    "lastUpdated" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."BranchInventory" OWNER TO "user";

--
-- Name: BranchPerformance; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."BranchPerformance" (
    id text NOT NULL,
    "branchId" text NOT NULL,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    "periodType" text NOT NULL,
    revenue double precision DEFAULT 0 NOT NULL,
    profit double precision DEFAULT 0 NOT NULL,
    margin double precision,
    "totalCustomers" integer DEFAULT 0 NOT NULL,
    "newCustomers" integer DEFAULT 0 NOT NULL,
    "returningCustomers" integer DEFAULT 0 NOT NULL,
    "returnRate" double precision,
    "totalServices" integer DEFAULT 0 NOT NULL,
    "avgServiceTime" double precision,
    "conversionRate" double precision,
    "productCost" double precision DEFAULT 0 NOT NULL,
    "staffCost" double precision DEFAULT 0 NOT NULL,
    "otherCosts" double precision DEFAULT 0 NOT NULL,
    "avgQualityScore" double precision,
    "errorRate" double precision,
    "customerRating" double precision,
    "lossRate" double precision,
    "wasteAmount" double precision
);


ALTER TABLE public."BranchPerformance" OWNER TO "user";

--
-- Name: BranchStaffAssignment; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."BranchStaffAssignment" (
    id text NOT NULL,
    "staffId" text NOT NULL,
    "branchId" text NOT NULL,
    "assignmentType" text DEFAULT 'FULL_TIME'::text NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    schedule jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "startDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endDate" timestamp(3) without time zone
);


ALTER TABLE public."BranchStaffAssignment" OWNER TO "user";

--
-- Name: COGSCalculation; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."COGSCalculation" (
    id text NOT NULL,
    "serviceId" text,
    "bookingId" text,
    "invoiceId" text,
    "productsUsed" jsonb NOT NULL,
    "totalCOGS" double precision NOT NULL,
    quantity double precision,
    "cogsPerUnit" double precision,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "branchId" text,
    "staffId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."COGSCalculation" OWNER TO "user";

--
-- Name: Cashflow; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Cashflow" (
    id text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "totalInflow" double precision DEFAULT 0 NOT NULL,
    "inflowBreakdown" jsonb,
    "totalOutflow" double precision DEFAULT 0 NOT NULL,
    "outflowBreakdown" jsonb,
    "netCashflow" double precision NOT NULL,
    "openingBalance" double precision,
    "closingBalance" double precision,
    "branchId" text,
    "partnerId" text,
    "cashAmount" double precision DEFAULT 0,
    "cardAmount" double precision DEFAULT 0,
    "transferAmount" double precision DEFAULT 0,
    "eWalletAmount" double precision DEFAULT 0,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Cashflow" OWNER TO "user";

--
-- Name: Certification; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Certification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "levelId" text NOT NULL,
    role text NOT NULL,
    level integer NOT NULL,
    "issuedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    metadata jsonb
);


ALTER TABLE public."Certification" OWNER TO "user";

--
-- Name: ChemicalHistoryRisk; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."ChemicalHistoryRisk" (
    id text NOT NULL,
    "customerId" text,
    "chemicalHistory" jsonb NOT NULL,
    "lastPerm" timestamp(3) without time zone,
    "lastColor" timestamp(3) without time zone,
    "lastBleach" timestamp(3) without time zone,
    "lastStraighten" timestamp(3) without time zone,
    "lastTreatment" timestamp(3) without time zone,
    "permFrequency" text,
    "colorFrequency" text,
    "homeDyeing" boolean,
    "heatStyling" boolean,
    "riskLevel" text NOT NULL,
    "riskScore" double precision,
    "riskFactors" text[],
    "cumulativeDamage" double precision,
    "safeToPerm" boolean,
    "safeToColor" boolean,
    "safeToBleach" boolean,
    recommendations text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ChemicalHistoryRisk" OWNER TO "user";

--
-- Name: ColorAnalysis; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."ColorAnalysis" (
    id text NOT NULL,
    "imageId" text NOT NULL,
    "baseLevel" integer,
    "baseTone" text,
    "baseColor" text,
    "midLevel" integer,
    "midTone" text,
    "midColor" text,
    "endLevel" integer,
    "endTone" text,
    "endColor" text,
    "hasHighlights" boolean DEFAULT false NOT NULL,
    "highlightLevel" integer,
    "highlightTone" text,
    "highlightColor" text,
    "highlightDistribution" text,
    undertone text,
    saturation double precision,
    lightness double precision,
    "overallColorDesc" text,
    technique text,
    "aiDescription" text,
    confidence double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ColorAnalysis" OWNER TO "user";

--
-- Name: ColorRecommendation; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."ColorRecommendation" (
    id text NOT NULL,
    "customerId" text,
    "faceAnalysisId" text,
    "hairConditionId" text,
    "skinTone" text,
    "skinToneLevel" double precision,
    undertone text,
    "eyeColor" text,
    "personalStyle" text,
    "recommendedColor" text NOT NULL,
    "colorCategory" text,
    "colorCode" text,
    "baseColor" text,
    technique text,
    developer text,
    reasons text[],
    benefits text[],
    warnings text[],
    alternatives jsonb,
    confidence double precision,
    "matchScore" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ColorRecommendation" OWNER TO "user";

--
-- Name: CommissionRecord; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."CommissionRecord" (
    id text NOT NULL,
    "staffId" text NOT NULL,
    "invoiceId" text,
    "serviceId" text,
    "productId" text,
    amount integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CommissionRecord" OWNER TO "user";

--
-- Name: CompetitorAnalysis; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."CompetitorAnalysis" (
    id text NOT NULL,
    "competitorName" text NOT NULL,
    location text,
    "servicePrices" jsonb,
    services jsonb,
    "activeCampaigns" jsonb,
    promotions jsonb,
    strengths jsonb,
    weaknesses jsonb,
    opportunities jsonb,
    "analyzedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CompetitorAnalysis" OWNER TO "user";

--
-- Name: ConsistencyMetrics; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."ConsistencyMetrics" (
    id text NOT NULL,
    "staffId" text,
    "serviceId" text,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    "avgSetting" double precision,
    "avgProductAmount" double precision,
    "avgTiming" double precision,
    "avgQualityScore" double precision,
    "teamAvgSetting" double precision,
    "teamAvgQuality" double precision,
    "consistencyScore" double precision,
    deviation double precision,
    analysis text,
    recommendations text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ConsistencyMetrics" OWNER TO "user";

--
-- Name: ConsumptionTracking; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."ConsumptionTracking" (
    id text NOT NULL,
    "productId" text NOT NULL,
    date date NOT NULL,
    "quantityUsed" double precision NOT NULL,
    "serviceCount" integer DEFAULT 0 NOT NULL,
    "peakUsage" double precision,
    "lowUsage" double precision,
    "topStaffId" text
);


ALTER TABLE public."ConsumptionTracking" OWNER TO "user";

--
-- Name: ContentLibrary; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."ContentLibrary" (
    id text NOT NULL,
    type text NOT NULL,
    topic text,
    content jsonb,
    cta text,
    platform text,
    style text,
    tags text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ContentLibrary" OWNER TO "user";

--
-- Name: CorrectionSuggestion; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."CorrectionSuggestion" (
    id text NOT NULL,
    "errorId" text,
    "bookingId" text,
    suggestion text NOT NULL,
    action text,
    priority text DEFAULT 'MEDIUM'::text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "appliedAt" timestamp(3) without time zone,
    "isAIGenerated" boolean DEFAULT true NOT NULL,
    confidence double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CorrectionSuggestion" OWNER TO "user";

--
-- Name: CrossBranchQuality; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."CrossBranchQuality" (
    id text NOT NULL,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    "branchMetrics" jsonb NOT NULL,
    "avgQuality" double precision,
    "bestBranch" text,
    "worstBranch" text,
    analysis text,
    recommendations text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CrossBranchQuality" OWNER TO "user";

--
-- Name: CurlPatternAnalysis; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."CurlPatternAnalysis" (
    id text NOT NULL,
    "imageId" text NOT NULL,
    "curlPattern" text,
    "curlPatternDesc" text,
    bounce text,
    density text,
    "curlDirection" text,
    "curlSize" double precision,
    "curlTightness" text,
    "curlDistribution" jsonb,
    "aiDescription" text,
    confidence double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CurlPatternAnalysis" OWNER TO "user";

--
-- Name: Customer; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Customer" (
    id text NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    birthday timestamp(3) without time zone,
    gender text,
    avatar text,
    notes text,
    "riskLevel" text,
    "preferredStylist" text,
    "totalSpent" integer DEFAULT 0 NOT NULL,
    "totalVisits" integer DEFAULT 0 NOT NULL,
    "journeyState" public."CustomerJourneyState" DEFAULT 'AWARENESS'::public."CustomerJourneyState" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Customer" OWNER TO "user";

--
-- Name: CustomerBehavior; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."CustomerBehavior" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "behaviorType" text NOT NULL,
    "behaviorData" jsonb,
    confidence double precision,
    "totalSpent" double precision DEFAULT 0 NOT NULL,
    "visitCount" integer DEFAULT 0 NOT NULL,
    "averageSpend" double precision DEFAULT 0 NOT NULL,
    "favoriteService" text,
    "visitFrequency" double precision,
    "lastVisit" timestamp(3) without time zone,
    "nextPredictedVisit" timestamp(3) without time zone,
    "preferredStylist" text,
    "preferredTime" text,
    "preferredDay" text,
    "lifetimeValue" double precision DEFAULT 0 NOT NULL,
    "predictedValue" double precision,
    "aiAnalysis" text,
    tags text[],
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CustomerBehavior" OWNER TO "user";

--
-- Name: CustomerExperience; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."CustomerExperience" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "serviceId" text,
    "visitId" text,
    "consultationScore" double precision,
    "technicalScore" double precision,
    "attitudeScore" double precision,
    "waitTimeScore" double precision,
    "valueScore" double precision,
    "careScore" double precision,
    "overallScore" double precision NOT NULL,
    strengths text,
    improvements text,
    feedback text,
    "aiAnalysis" text,
    sentiment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CustomerExperience" OWNER TO "user";

--
-- Name: CustomerInsight; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."CustomerInsight" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "churnRisk" text NOT NULL,
    "revisitWindow" text NOT NULL,
    "nextService" text NOT NULL,
    promotion text NOT NULL,
    summary text NOT NULL,
    "actionSteps" jsonb NOT NULL,
    predictions jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CustomerInsight" OWNER TO "user";

--
-- Name: CustomerJourney; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."CustomerJourney" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "journeyStage" text NOT NULL,
    "stageData" jsonb,
    touchpoint text,
    "touchpointData" jsonb,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    source text,
    campaign text,
    device text
);


ALTER TABLE public."CustomerJourney" OWNER TO "user";

--
-- Name: CustomerLoyalty; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."CustomerLoyalty" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "tierId" text,
    "totalPoints" integer NOT NULL,
    "lifetimePts" integer NOT NULL
);


ALTER TABLE public."CustomerLoyalty" OWNER TO "user";

--
-- Name: CustomerMembership; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."CustomerMembership" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "currentTier" text DEFAULT 'MEMBER'::text NOT NULL,
    "totalSpending" double precision DEFAULT 0 NOT NULL,
    "periodSpending" double precision DEFAULT 0 NOT NULL,
    "periodStart" timestamp(3) without time zone,
    "periodEnd" timestamp(3) without time zone,
    "totalVisits" integer DEFAULT 0 NOT NULL,
    "periodVisits" integer DEFAULT 0 NOT NULL,
    "currentPoints" double precision DEFAULT 0 NOT NULL,
    "lifetimePoints" double precision DEFAULT 0 NOT NULL,
    "pointsRedeemed" double precision DEFAULT 0 NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "tierUpgradedAt" timestamp(3) without time zone,
    "lastVisitAt" timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone
);


ALTER TABLE public."CustomerMembership" OWNER TO "user";

--
-- Name: CustomerPersonalityProfile; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."CustomerPersonalityProfile" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "curlPreference" text,
    "lengthPreference" text,
    "stylePreference" text,
    "colorPreference" text[],
    "colorTonePreference" text,
    "colorIntensityPreference" text,
    "styleVibe" text[],
    personality text,
    "hairCareHabits" text[],
    lifestyle text,
    "communicationStyle" text,
    "followUpPreference" text,
    "personalitySummary" text,
    "aestheticProfile" jsonb,
    "preferencesScore" jsonb,
    "interactionsCount" integer DEFAULT 0 NOT NULL,
    "lastUpdated" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CustomerPersonalityProfile" OWNER TO "user";

--
-- Name: CustomerPhoto; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."CustomerPhoto" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "imageUrl" text NOT NULL,
    description text,
    "uploadedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CustomerPhoto" OWNER TO "user";

--
-- Name: CustomerPrediction; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."CustomerPrediction" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "predictionType" text NOT NULL,
    "returnProbability" double precision,
    "predictedReturnDate" timestamp(3) without time zone,
    "predictedService" text,
    "predictedSpend" double precision,
    "modelVersion" text,
    confidence double precision,
    factors jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone
);


ALTER TABLE public."CustomerPrediction" OWNER TO "user";

--
-- Name: CustomerProfile; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."CustomerProfile" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    name text,
    phone text,
    "avatarUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "journeyState" text DEFAULT 'AWARENESS'::text NOT NULL,
    preferences jsonb,
    "hairHistory" jsonb,
    "technicalHistory" jsonb,
    "bookingHistory" jsonb,
    "chatHistory" jsonb,
    insight jsonb
);


ALTER TABLE public."CustomerProfile" OWNER TO "user";

--
-- Name: CustomerRiskAlert; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."CustomerRiskAlert" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "riskType" text NOT NULL,
    "riskScore" double precision NOT NULL,
    severity text NOT NULL,
    factors jsonb,
    "lastContact" timestamp(3) without time zone,
    "daysSinceLastVisit" integer,
    "lastScore" double precision,
    "churnProbability" double precision,
    "predictedChurnDate" timestamp(3) without time zone,
    "recommendedAction" text,
    "actionTaken" text,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "detectedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "resolvedAt" timestamp(3) without time zone
);


ALTER TABLE public."CustomerRiskAlert" OWNER TO "user";

--
-- Name: CustomerStyleHistory; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."CustomerStyleHistory" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "bookingId" text,
    "serviceId" text,
    "styleName" text,
    "styleType" text,
    "curlPattern" text,
    "colorTone" text,
    length text,
    "customerFeedback" text,
    "likedFeatures" text[],
    "dislikedFeatures" text[],
    satisfaction double precision,
    "returnIntent" boolean,
    "usedForLearning" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CustomerStyleHistory" OWNER TO "user";

--
-- Name: CustomerTag; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."CustomerTag" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    tag text NOT NULL,
    category text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CustomerTag" OWNER TO "user";

--
-- Name: CustomerTouchpoint; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."CustomerTouchpoint" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    type text NOT NULL,
    channel text,
    "responseTime" integer,
    content text,
    outcome text,
    metadata jsonb,
    "staffId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CustomerTouchpoint" OWNER TO "user";

--
-- Name: DailyReport; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."DailyReport" (
    id text NOT NULL,
    "reportDate" date NOT NULL,
    "totalRevenue" double precision DEFAULT 0 NOT NULL,
    "totalCost" double precision DEFAULT 0 NOT NULL,
    profit double precision DEFAULT 0 NOT NULL,
    margin double precision DEFAULT 0 NOT NULL,
    "totalServices" integer DEFAULT 0 NOT NULL,
    "servicesByCategory" jsonb,
    "topServices" jsonb,
    "totalProductCost" double precision DEFAULT 0 NOT NULL,
    "productsUsed" jsonb,
    "unusualUsage" jsonb,
    "stockChanges" jsonb,
    "lowStockItems" jsonb,
    "stockWarnings" jsonb,
    "lossAlerts" jsonb,
    "highLossProducts" jsonb,
    "totalLoss" double precision DEFAULT 0 NOT NULL,
    "staffRevenue" jsonb,
    "staffUsage" jsonb,
    "topPerformers" jsonb,
    "staffWarnings" jsonb,
    strengths jsonb,
    risks jsonb,
    predictions jsonb,
    recommendations jsonb,
    "aiAnalysis" text,
    "emailSent" boolean DEFAULT false NOT NULL,
    "emailSentAt" timestamp(3) without time zone,
    "zaloSent" boolean DEFAULT false NOT NULL,
    "zaloSentAt" timestamp(3) without time zone,
    "notificationSent" boolean DEFAULT false NOT NULL,
    "notificationSentAt" timestamp(3) without time zone,
    "generatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "generatedBy" text
);


ALTER TABLE public."DailyReport" OWNER TO "user";

--
-- Name: DamageLevelAssessment; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."DamageLevelAssessment" (
    id text NOT NULL,
    "customerId" text,
    "scanId" text,
    "damageLevel" double precision NOT NULL,
    "damageCategory" text NOT NULL,
    status text,
    "cuticleDamage" double precision,
    "cortexDamage" double precision,
    "medullaDamage" double precision,
    "breakageRisk" text,
    "canPerm" boolean,
    "canColor" boolean,
    "canBleach" boolean,
    assessment text,
    warnings text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DamageLevelAssessment" OWNER TO "user";

--
-- Name: DynamicPricing; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."DynamicPricing" (
    id text NOT NULL,
    "serviceId" text NOT NULL,
    "branchId" text,
    "stylistId" text,
    "basePrice" double precision NOT NULL,
    "adjustedPrice" double precision NOT NULL,
    "adjustmentAmount" double precision DEFAULT 0 NOT NULL,
    "adjustmentPercent" double precision DEFAULT 0 NOT NULL,
    "appliedRules" text[],
    "timeSlot" text,
    "dayOfWeek" integer,
    "demandLevel" text,
    "trafficLevel" text,
    "effectiveFrom" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "effectiveUntil" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DynamicPricing" OWNER TO "user";

--
-- Name: ErrorDetection; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."ErrorDetection" (
    id text NOT NULL,
    "bookingId" text,
    "serviceId" text,
    "staffId" text,
    "errorType" text NOT NULL,
    "errorCategory" text NOT NULL,
    severity text NOT NULL,
    location text,
    description text NOT NULL,
    "detectedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "detectionMethod" text NOT NULL,
    status text DEFAULT 'DETECTED'::text NOT NULL,
    corrected boolean DEFAULT false NOT NULL,
    "correctedAt" timestamp(3) without time zone,
    "correctionNotes" text
);


ALTER TABLE public."ErrorDetection" OWNER TO "user";

--
-- Name: ExerciseSubmission; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."ExerciseSubmission" (
    id text NOT NULL,
    "exerciseId" text NOT NULL,
    "userId" text NOT NULL,
    answer jsonb NOT NULL,
    score integer,
    feedback jsonb,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ExerciseSubmission" OWNER TO "user";

--
-- Name: Expense; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Expense" (
    id text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    amount double precision NOT NULL,
    category text NOT NULL,
    "subCategory" text,
    description text NOT NULL,
    currency text DEFAULT 'VND'::text NOT NULL,
    "branchId" text,
    "partnerId" text,
    "paymentMethod" text,
    vendor text,
    "receiptUrl" text,
    "invoiceNumber" text,
    "approvedBy" text,
    "approvedAt" timestamp(3) without time zone,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "isRecurring" boolean DEFAULT false NOT NULL,
    "recurringPeriod" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Expense" OWNER TO "user";

--
-- Name: FaceAnalysis; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."FaceAnalysis" (
    id text NOT NULL,
    "customerId" text,
    "faceShape" text NOT NULL,
    jawline text,
    forehead text,
    cheekbones text,
    chin text,
    features text,
    "overallVibe" text,
    "analysisData" jsonb,
    "imageUrl" text,
    "isAIGenerated" boolean DEFAULT true NOT NULL,
    confidence double precision,
    recommendations text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FaceAnalysis" OWNER TO "user";

--
-- Name: FinancialForecast; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."FinancialForecast" (
    id text NOT NULL,
    "forecastDate" timestamp(3) without time zone NOT NULL,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    "periodType" text NOT NULL,
    "forecastRevenue" double precision,
    "forecastExpenses" double precision,
    "forecastProfit" double precision,
    "forecastBreakdown" jsonb,
    confidence double precision,
    factors jsonb,
    assumptions jsonb,
    "branchId" text,
    "partnerId" text,
    "aiAnalysis" text,
    recommendations text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."FinancialForecast" OWNER TO "user";

--
-- Name: FinancialMetric; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."FinancialMetric" (
    id text NOT NULL,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    "periodType" text NOT NULL,
    "totalRevenue" double precision DEFAULT 0 NOT NULL,
    "totalExpenses" double precision DEFAULT 0 NOT NULL,
    "totalCOGS" double precision DEFAULT 0 NOT NULL,
    "grossProfit" double precision DEFAULT 0 NOT NULL,
    "netProfit" double precision DEFAULT 0 NOT NULL,
    "grossMargin" double precision,
    "netMargin" double precision,
    "avgTransactionValue" double precision,
    "customerCount" integer,
    "servicesCount" integer,
    "branchId" text,
    "partnerId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."FinancialMetric" OWNER TO "user";

--
-- Name: FinancialRiskAlert; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."FinancialRiskAlert" (
    id text NOT NULL,
    "alertType" text NOT NULL,
    severity text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "currentValue" double precision,
    "previousValue" double precision,
    "changePercent" double precision,
    "branchId" text,
    "partnerId" text,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    recommendations text[],
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "acknowledgedBy" text,
    "acknowledgedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FinancialRiskAlert" OWNER TO "user";

--
-- Name: FollowUpMessage; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."FollowUpMessage" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    phone text,
    "ruleId" text NOT NULL,
    "messageType" text NOT NULL,
    message text NOT NULL,
    "scheduledFor" timestamp(3) without time zone NOT NULL,
    "sentAt" timestamp(3) without time zone,
    status text DEFAULT 'pending'::text NOT NULL,
    channel text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FollowUpMessage" OWNER TO "user";

--
-- Name: HQNotification; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."HQNotification" (
    id text NOT NULL,
    "partnerId" text,
    type text NOT NULL,
    priority text DEFAULT 'MEDIUM'::text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "actionUrl" text,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "sentAt" timestamp(3) without time zone,
    "readAt" timestamp(3) without time zone,
    recipients jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."HQNotification" OWNER TO "user";

--
-- Name: HairAnalysisVideo; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."HairAnalysisVideo" (
    id text NOT NULL,
    "videoUrl" text NOT NULL,
    "thumbnailUrl" text,
    "videoType" text DEFAULT 'HAIR_ANALYSIS'::text NOT NULL,
    duration double precision,
    "frameCount" integer,
    fps double precision,
    resolution text,
    "fileSize" integer,
    "mimeType" text,
    "customerId" text,
    "staffId" text,
    "branchId" text,
    "partnerId" text,
    "bookingId" text,
    "originalFileName" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HairAnalysisVideo" OWNER TO "user";

--
-- Name: HairConditionAnalysis; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."HairConditionAnalysis" (
    id text NOT NULL,
    "customerId" text,
    thickness text,
    density text,
    elasticity text,
    "damageLevel" double precision,
    porosity text,
    dryness text,
    texture text,
    "chemicalHistory" jsonb,
    "lastTreatment" text,
    "lastTreatmentDate" timestamp(3) without time zone,
    "canPerm" boolean,
    "canColor" boolean,
    "riskLevel" text,
    recommendations text,
    "recommendedProducts" text[],
    "isAIGenerated" boolean DEFAULT true NOT NULL,
    confidence double precision,
    "analysisNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HairConditionAnalysis" OWNER TO "user";

--
-- Name: HairDamageMapping; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."HairDamageMapping" (
    id text NOT NULL,
    "videoId" text NOT NULL,
    "damageZones" jsonb,
    "overallDamage" double precision,
    "damageLevel" text,
    "damageTypes" text[],
    "endsDamage" double precision,
    "midDamage" double precision,
    "rootDamage" double precision,
    "crownDamage" double precision,
    "sidesDamage" double precision,
    "endsSeverity" text,
    "midSeverity" text,
    "rootSeverity" text,
    "damageMapUrl" text,
    "aiDescription" text,
    confidence double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HairDamageMapping" OWNER TO "user";

--
-- Name: HairElasticityAnalysis; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."HairElasticityAnalysis" (
    id text NOT NULL,
    "videoId" text NOT NULL,
    "stretchPercent" double precision,
    "snapbackRate" double precision,
    "elasticityScore" double precision,
    "gumHairRisk" text,
    "breakageRisk" text,
    "damageRisk" text,
    "testType" text,
    "stretchDistance" double precision,
    "recoveryTime" double precision,
    "elasticityStatus" text,
    "aiDescription" text,
    recommendations text[],
    confidence double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HairElasticityAnalysis" OWNER TO "user";

--
-- Name: HairFormula; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."HairFormula" (
    id text NOT NULL,
    "imageId" text NOT NULL,
    "formulaType" text NOT NULL,
    "permProduct" text,
    "permStrength" text,
    "permSetting" text,
    "permTime" integer,
    "permHeat" double precision,
    "permSteps" jsonb,
    "colorTubes" jsonb,
    "colorOxy" jsonb,
    "colorTime" integer,
    "colorSteps" jsonb,
    "preTreatment" text,
    "postTreatment" text,
    warnings text[],
    notes text[],
    "riskLevel" text,
    "riskFactors" text[],
    "aiGenerated" boolean DEFAULT true NOT NULL,
    confidence double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HairFormula" OWNER TO "user";

--
-- Name: HairHealthScan; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."HairHealthScan" (
    id text NOT NULL,
    "customerId" text,
    "imageUrl" text,
    "videoUrl" text,
    "healthScore" double precision,
    dryness double precision,
    elasticity text,
    "damageSpots" integer,
    porosity text,
    "moistureRetention" text,
    shine double precision,
    "colorEvenness" double precision,
    "patchyColor" boolean,
    "brokenStrands" integer,
    "splitEnds" integer,
    "whiteDots" integer,
    "burnedHair" integer,
    "puffyHair" boolean,
    "damageAtRoot" boolean,
    "damageAtMid" boolean,
    "damageAtEnd" boolean,
    "aiAnalysis" text,
    "detectedIssues" text[],
    recommendations text,
    "isAIGenerated" boolean DEFAULT true NOT NULL,
    confidence double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HairHealthScan" OWNER TO "user";

--
-- Name: HairMovementAnalysis; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."HairMovementAnalysis" (
    id text NOT NULL,
    "videoId" text NOT NULL,
    "movementScore" double precision,
    "bounceScore" double precision,
    "frizzScore" double precision,
    "fiberCohesion" double precision,
    "softnessScore" double precision,
    "movementType" text,
    "bounceLevel" text,
    "frizzLevel" text,
    "densityDistribution" jsonb,
    "fiberInteraction" text,
    "aiDescription" text,
    confidence double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HairMovementAnalysis" OWNER TO "user";

--
-- Name: HairProcedure; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."HairProcedure" (
    id text NOT NULL,
    "imageId" text NOT NULL,
    "styleAnalysisId" text,
    "curlAnalysisId" text,
    "colorAnalysisId" text,
    "formulaId" text,
    "procedureType" text NOT NULL,
    "preProcedure" jsonb,
    "mainProcedure" jsonb NOT NULL,
    "postProcedure" jsonb,
    products jsonb,
    "estimatedTime" integer,
    aftercare jsonb,
    "fullSOP" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HairProcedure" OWNER TO "user";

--
-- Name: HairSimulation; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."HairSimulation" (
    id text NOT NULL,
    "customerId" text,
    "recommendationId" text,
    "originalImageUrl" text NOT NULL,
    style text,
    color text,
    length text,
    "simulatedImageUrl" text,
    "simulationType" text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    progress double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HairSimulation" OWNER TO "user";

--
-- Name: HairStyleAnalysis; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."HairStyleAnalysis" (
    id text NOT NULL,
    "imageId" text NOT NULL,
    "styleType" text,
    length text,
    "lengthCm" double precision,
    texture text,
    "hairThickness" text,
    "volumeTop" text,
    "volumeSide" text,
    "shineLevel" double precision,
    dryness double precision,
    "damageLevel" double precision,
    porosity text,
    "colorLevel" integer,
    "baseTone" text,
    "overallColor" text,
    "existingPattern" text,
    "aiDescription" text,
    confidence double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HairStyleAnalysis" OWNER TO "user";

--
-- Name: HairStyleImage; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."HairStyleImage" (
    id text NOT NULL,
    "imageUrl" text NOT NULL,
    "imageType" text DEFAULT 'HAIR_STYLE'::text NOT NULL,
    "thumbnailUrl" text,
    "customerId" text,
    "staffId" text,
    "branchId" text,
    "partnerId" text,
    "originalFileName" text,
    "fileSize" integer,
    "mimeType" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HairStyleImage" OWNER TO "user";

--
-- Name: HairSurfaceAnalysis; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."HairSurfaceAnalysis" (
    id text NOT NULL,
    "videoId" text NOT NULL,
    "shineLevel" double precision,
    "porosityLevel" text,
    "drynessLevel" double precision,
    "lightAbsorption" double precision,
    "lightReflection" double precision,
    "colorUptake" double precision,
    "smoothnessScore" double precision,
    "roughnessScore" double precision,
    "surfaceCondition" text,
    "aiDescription" text,
    confidence double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HairSurfaceAnalysis" OWNER TO "user";

--
-- Name: HairVideoRecommendation; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."HairVideoRecommendation" (
    id text NOT NULL,
    "videoId" text NOT NULL,
    "hairHealthScore" double precision,
    "healthStatus" text,
    "permHotSuitable" boolean,
    "permColdSuitable" boolean,
    "permAcidSuitable" boolean,
    "colorLightSuitable" boolean,
    "colorDarkSuitable" boolean,
    "overallRisk" text,
    "riskFactors" text[],
    "recommendedProducts" text[],
    "recommendedTechniques" text[],
    "treatmentPlan" jsonb,
    "recoveryPlan" jsonb,
    "permFormula" jsonb,
    "colorFormula" jsonb,
    "fullRecommendation" text,
    "aiDescription" text,
    confidence double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HairVideoRecommendation" OWNER TO "user";

--
-- Name: HairstyleRecommendation; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."HairstyleRecommendation" (
    id text NOT NULL,
    "customerId" text,
    "faceAnalysisId" text,
    "hairConditionId" text,
    "recommendedStyle" text NOT NULL,
    "styleCategory" text,
    description text,
    "curlSize" text,
    "layerStyle" text,
    length text,
    "recommendedProduct" text,
    "permSetting" jsonb,
    reasons text[],
    benefits text[],
    warnings text[],
    confidence double precision,
    "matchScore" double precision,
    "faceShapeMatch" jsonb,
    alternatives jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HairstyleRecommendation" OWNER TO "user";

--
-- Name: InventoryProjection; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."InventoryProjection" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "projectionDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "currentStock" double precision NOT NULL,
    "safetyStock" double precision,
    "averageDailyUsage" double precision NOT NULL,
    "peakDailyUsage" double precision,
    "lowDailyUsage" double precision,
    "projection7Days" double precision NOT NULL,
    "projection14Days" double precision NOT NULL,
    "projection30Days" double precision NOT NULL,
    "daysUntilEmpty" double precision,
    "seasonalFactor" double precision DEFAULT 1.0,
    "trendFactor" double precision DEFAULT 1.0,
    "adjustedProjection30Days" double precision,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "needsRestock" boolean DEFAULT false NOT NULL,
    "restockPriority" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."InventoryProjection" OWNER TO "user";

--
-- Name: Invoice; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Invoice" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "branchId" text NOT NULL,
    "bookingId" text,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    total integer NOT NULL
);


ALTER TABLE public."Invoice" OWNER TO "user";

--
-- Name: InvoiceItem; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."InvoiceItem" (
    id text NOT NULL,
    "invoiceId" text NOT NULL,
    "serviceId" text,
    "productId" text,
    amount integer NOT NULL
);


ALTER TABLE public."InvoiceItem" OWNER TO "user";

--
-- Name: KPISummary; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."KPISummary" (
    id text NOT NULL,
    "staffId" text NOT NULL,
    month text NOT NULL,
    revenue integer NOT NULL,
    "serviceCount" integer NOT NULL,
    "productSales" integer NOT NULL,
    score integer NOT NULL
);


ALTER TABLE public."KPISummary" OWNER TO "user";

--
-- Name: License; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."License" (
    id text NOT NULL,
    "partnerId" text NOT NULL,
    plan text NOT NULL,
    price double precision NOT NULL,
    period integer NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "autoRenew" boolean DEFAULT true NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "paymentStatus" text DEFAULT 'PENDING'::text NOT NULL,
    "lastPaymentDate" timestamp(3) without time zone,
    "nextPaymentDate" timestamp(3) without time zone,
    "paymentHistory" jsonb,
    "reminderSent" boolean DEFAULT false NOT NULL,
    "reminderSentAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."License" OWNER TO "user";

--
-- Name: Location; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Location" (
    id text NOT NULL,
    "branchId" text NOT NULL,
    code text NOT NULL,
    zone text,
    rack text,
    shelf text,
    bin text,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    capacity integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Location" OWNER TO "user";

--
-- Name: LossAlert; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."LossAlert" (
    id text NOT NULL,
    type text NOT NULL,
    severity text NOT NULL,
    "productId" text,
    "staffId" text,
    "serviceId" text,
    "mixLogId" text,
    "expectedQty" double precision,
    "actualQty" double precision,
    "lossQty" double precision,
    "lossRate" double precision,
    "fraudPattern" text,
    "fraudScore" double precision,
    behavior text,
    "thresholdType" text,
    "thresholdValue" double precision,
    deviation double precision,
    description text,
    recommendation text,
    status text DEFAULT 'OPEN'::text NOT NULL,
    "detectedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "reviewedAt" timestamp(3) without time zone,
    "reviewedBy" text,
    "resolvedAt" timestamp(3) without time zone
);


ALTER TABLE public."LossAlert" OWNER TO "user";

--
-- Name: LoyaltyPoint; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."LoyaltyPoint" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "invoiceId" text,
    points integer NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LoyaltyPoint" OWNER TO "user";

--
-- Name: LoyaltyPrediction; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."LoyaltyPrediction" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "predictionType" text NOT NULL,
    score double precision NOT NULL,
    "predictedValue" text,
    confidence double precision,
    "predictedDate" timestamp(3) without time zone,
    factors jsonb,
    "aiAnalysis" text,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."LoyaltyPrediction" OWNER TO "user";

--
-- Name: LoyaltyTier; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."LoyaltyTier" (
    id text NOT NULL,
    name public."LoyaltyTierName" NOT NULL,
    "minSpend" integer NOT NULL,
    discount integer NOT NULL,
    perks jsonb NOT NULL
);


ALTER TABLE public."LoyaltyTier" OWNER TO "user";

--
-- Name: MarketingAutomation; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."MarketingAutomation" (
    id text NOT NULL,
    "campaignId" text,
    name text NOT NULL,
    "triggerType" text NOT NULL,
    segment text,
    steps jsonb NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    triggered integer DEFAULT 0 NOT NULL,
    completed integer DEFAULT 0 NOT NULL,
    conversion integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MarketingAutomation" OWNER TO "user";

--
-- Name: MarketingCampaign; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."MarketingCampaign" (
    id text NOT NULL,
    type text NOT NULL,
    name text NOT NULL,
    description text,
    segment jsonb NOT NULL,
    channel text NOT NULL,
    status text NOT NULL,
    "scheduledAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."MarketingCampaign" OWNER TO "user";

--
-- Name: MarketingChannel; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."MarketingChannel" (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MarketingChannel" OWNER TO "user";

--
-- Name: MarketingContent; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."MarketingContent" (
    id text NOT NULL,
    "campaignId" text,
    "contentType" text NOT NULL,
    title text,
    content text NOT NULL,
    "imagePrompt" text,
    hashtags text[],
    platform text,
    "scheduledDate" timestamp(3) without time zone,
    "publishedDate" timestamp(3) without time zone,
    "isPublished" boolean DEFAULT false NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    likes integer DEFAULT 0 NOT NULL,
    comments integer DEFAULT 0 NOT NULL,
    shares integer DEFAULT 0 NOT NULL,
    clicks integer DEFAULT 0 NOT NULL,
    "isAIGenerated" boolean DEFAULT false NOT NULL,
    "aiModel" text,
    "generationPrompt" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MarketingContent" OWNER TO "user";

--
-- Name: MarketingDataPoint; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."MarketingDataPoint" (
    id text NOT NULL,
    "channelId" text NOT NULL,
    date date NOT NULL,
    leads integer DEFAULT 0 NOT NULL,
    bookings integer DEFAULT 0 NOT NULL,
    arrivals integer DEFAULT 0 NOT NULL,
    conversions integer DEFAULT 0 NOT NULL,
    "adSpend" double precision DEFAULT 0 NOT NULL,
    "totalCost" double precision DEFAULT 0 NOT NULL,
    revenue double precision DEFAULT 0 NOT NULL,
    "costPerLead" double precision,
    "costPerCustomer" double precision,
    "conversionRate" double precision,
    "returnRate" double precision,
    metadata jsonb
);


ALTER TABLE public."MarketingDataPoint" OWNER TO "user";

--
-- Name: MarketingLog; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."MarketingLog" (
    id text NOT NULL,
    "campaignId" text NOT NULL,
    "customerId" text NOT NULL,
    channel text NOT NULL,
    status text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."MarketingLog" OWNER TO "user";

--
-- Name: MarketingSegment; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."MarketingSegment" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    criteria jsonb,
    "customerCount" integer DEFAULT 0 NOT NULL,
    "averageLTV" double precision DEFAULT 0 NOT NULL,
    "averageSpend" double precision DEFAULT 0 NOT NULL,
    "isAIGenerated" boolean DEFAULT false NOT NULL,
    "aiAnalysis" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MarketingSegment" OWNER TO "user";

--
-- Name: MarketingTrend; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."MarketingTrend" (
    id text NOT NULL,
    "trendType" text NOT NULL,
    title text NOT NULL,
    description text,
    popularity double precision,
    season text,
    source text,
    "aiAnalysis" text,
    recommendations jsonb,
    "detectedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone
);


ALTER TABLE public."MarketingTrend" OWNER TO "user";

--
-- Name: MembershipMetric; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."MembershipMetric" (
    id text NOT NULL,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    "periodType" text NOT NULL,
    tier text NOT NULL,
    "memberCount" integer DEFAULT 0 NOT NULL,
    "totalSpending" double precision DEFAULT 0 NOT NULL,
    "avgSpending" double precision DEFAULT 0 NOT NULL,
    "avgLTV" double precision DEFAULT 0 NOT NULL,
    "totalVisits" integer DEFAULT 0 NOT NULL,
    "avgVisits" double precision DEFAULT 0 NOT NULL,
    "retentionRate" double precision,
    upgrades integer DEFAULT 0 NOT NULL,
    downgrades integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."MembershipMetric" OWNER TO "user";

--
-- Name: MembershipTier; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."MembershipTier" (
    id text NOT NULL,
    "tierLevel" text NOT NULL,
    "tierName" text NOT NULL,
    "tierOrder" integer DEFAULT 0 NOT NULL,
    "minSpending" double precision DEFAULT 0 NOT NULL,
    "periodMonths" integer DEFAULT 12 NOT NULL,
    "minVisits" integer,
    "minLTV" double precision,
    "pointMultiplier" double precision DEFAULT 1.0 NOT NULL,
    benefits jsonb NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MembershipTier" OWNER TO "user";

--
-- Name: MinaMemory; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."MinaMemory" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "memoryType" text NOT NULL,
    category text,
    key text NOT NULL,
    value text,
    details jsonb,
    source text,
    "sourceId" text,
    confidence double precision DEFAULT 0.5 NOT NULL,
    "confirmedCount" integer DEFAULT 1 NOT NULL,
    "lastUsed" timestamp(3) without time zone,
    "usageCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "expiresAt" timestamp(3) without time zone
);


ALTER TABLE public."MinaMemory" OWNER TO "user";

--
-- Name: MixLog; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."MixLog" (
    id text NOT NULL,
    "serviceId" text,
    "visitId" text,
    "staffId" text NOT NULL,
    "productId" text NOT NULL,
    quantity double precision NOT NULL,
    "expectedQty" double precision,
    "actualQty" double precision NOT NULL,
    cost double precision NOT NULL,
    note text,
    "imageUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "branchId" text
);


ALTER TABLE public."MixLog" OWNER TO "user";

--
-- Name: MonthlyReport; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."MonthlyReport" (
    id text NOT NULL,
    "reportMonth" integer NOT NULL,
    "reportYear" integer NOT NULL,
    "totalRevenue" double precision DEFAULT 0 NOT NULL,
    "totalCost" double precision DEFAULT 0 NOT NULL,
    profit double precision DEFAULT 0 NOT NULL,
    margin double precision DEFAULT 0 NOT NULL,
    "revenueGrowth" double precision,
    "costChange" double precision,
    "totalCustomers" integer DEFAULT 0 NOT NULL,
    "returningCustomers" integer DEFAULT 0 NOT NULL,
    "newCustomers" integer DEFAULT 0 NOT NULL,
    "returnRate" double precision,
    "servicesByCategory" jsonb,
    "serviceRevenue" jsonb,
    "serviceCost" jsonb,
    "serviceProfit" jsonb,
    "serviceTrends" jsonb,
    "totalProductUsage" jsonb,
    "usageByCategory" jsonb,
    "averageUsagePerService" jsonb,
    "productCostByCategory" jsonb,
    "stockIn" double precision DEFAULT 0 NOT NULL,
    "stockOut" double precision DEFAULT 0 NOT NULL,
    "endingStock" double precision DEFAULT 0 NOT NULL,
    "excessStock" jsonb,
    "lowStockItems" jsonb,
    "averageLossRate" double precision,
    "lossChange" double precision,
    "highLossProducts" jsonb,
    "suspiciousStaff" jsonb,
    "inventoryMismatch" double precision,
    "staffRevenue" jsonb,
    "staffEfficiency" jsonb,
    "staffWarnings" jsonb,
    "topPerformers" jsonb,
    "costOptimization" jsonb,
    "inventoryOptimization" jsonb,
    "marketingSuggestions" jsonb,
    "trainingNeeds" jsonb,
    "aiSummary" text,
    "generatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "generatedBy" text
);


ALTER TABLE public."MonthlyReport" OWNER TO "user";

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    status public."NotificationStatus" NOT NULL,
    data jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notification" OWNER TO "user";

--
-- Name: OperationLog; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."OperationLog" (
    id text NOT NULL,
    "userId" text,
    role text NOT NULL,
    "sopStep" integer NOT NULL,
    action text NOT NULL,
    "customerId" text,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    meta jsonb
);


ALTER TABLE public."OperationLog" OWNER TO "user";

--
-- Name: Partner; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Partner" (
    id text NOT NULL,
    "salonName" text NOT NULL,
    "ownerName" text,
    phone text,
    email text,
    plan text DEFAULT 'BASIC'::text NOT NULL,
    "licenseStatus" text DEFAULT 'ACTIVE'::text NOT NULL,
    "licenseStartDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "licenseEndDate" timestamp(3) without time zone,
    timezone text DEFAULT 'Asia/Ho_Chi_Minh'::text,
    currency text DEFAULT 'VND'::text,
    language text DEFAULT 'vi'::text,
    metadata jsonb,
    notes text,
    "isActive" boolean DEFAULT true NOT NULL,
    "suspendedAt" timestamp(3) without time zone,
    "suspendedReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Partner" OWNER TO "user";

--
-- Name: PartnerPerformance; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."PartnerPerformance" (
    id text NOT NULL,
    "partnerId" text NOT NULL,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    "periodType" text NOT NULL,
    revenue double precision DEFAULT 0 NOT NULL,
    profit double precision DEFAULT 0 NOT NULL,
    margin double precision,
    "totalCustomers" integer DEFAULT 0 NOT NULL,
    "newCustomers" integer DEFAULT 0 NOT NULL,
    "returningCustomers" integer DEFAULT 0 NOT NULL,
    "returnRate" double precision,
    "totalServices" integer DEFAULT 0 NOT NULL,
    "avgServiceTime" double precision,
    "conversionRate" double precision,
    "upsaleRate" double precision,
    "productCost" double precision DEFAULT 0 NOT NULL,
    "staffCost" double precision DEFAULT 0 NOT NULL,
    "otherCosts" double precision DEFAULT 0 NOT NULL,
    "avgQualityScore" double precision,
    "errorRate" double precision,
    "customerRating" double precision,
    "lossRate" double precision,
    "wasteAmount" double precision,
    "aiAnalysis" text,
    strengths text[],
    weaknesses text[],
    recommendations text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PartnerPerformance" OWNER TO "user";

--
-- Name: PartnerQualityScore; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."PartnerQualityScore" (
    id text NOT NULL,
    "partnerId" text NOT NULL,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    "overallScore" double precision NOT NULL,
    "technicalScore" double precision,
    "serviceScore" double precision,
    "consistencyScore" double precision,
    "sopCompliance" double precision,
    "sopViolations" jsonb,
    "errorCount" integer DEFAULT 0 NOT NULL,
    "errorTypes" jsonb,
    "criticalErrors" integer DEFAULT 0 NOT NULL,
    "aiAnalysis" text,
    recommendations text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PartnerQualityScore" OWNER TO "user";

--
-- Name: PeakHourDetection; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."PeakHourDetection" (
    id text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "timeSlot" text NOT NULL,
    "dayOfWeek" integer NOT NULL,
    "bookingCount" integer DEFAULT 0 NOT NULL,
    "waitingCustomers" integer DEFAULT 0 NOT NULL,
    "availableSeats" integer DEFAULT 0 NOT NULL,
    "availableStylists" integer DEFAULT 0 NOT NULL,
    "totalStylists" integer DEFAULT 0 NOT NULL,
    "onlineInquiries" integer DEFAULT 0 NOT NULL,
    "pageViews" integer DEFAULT 0 NOT NULL,
    "trafficLevel" text NOT NULL,
    "peakScore" double precision DEFAULT 0 NOT NULL,
    "branchId" text,
    "serviceIds" text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PeakHourDetection" OWNER TO "user";

--
-- Name: PersonalizationMetric; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."PersonalizationMetric" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "personalizationScore" double precision,
    "recommendationAccuracy" double precision,
    "customerSatisfaction" double precision,
    "recommendationsReceived" integer DEFAULT 0 NOT NULL,
    "recommendationsAccepted" integer DEFAULT 0 NOT NULL,
    "recommendationsRejected" integer DEFAULT 0 NOT NULL,
    "minaInteractions" integer DEFAULT 0 NOT NULL,
    "followUpResponses" integer DEFAULT 0 NOT NULL,
    "bookingFrequency" double precision,
    "preferencesUpdated" integer DEFAULT 0 NOT NULL,
    "lastPreferenceUpdate" timestamp(3) without time zone,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    "periodType" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PersonalizationMetric" OWNER TO "user";

--
-- Name: PersonalizedFollowUp; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."PersonalizedFollowUp" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "bookingId" text,
    "serviceId" text,
    "followUpType" text NOT NULL,
    priority text DEFAULT 'MEDIUM'::text NOT NULL,
    tone text,
    length text,
    content text NOT NULL,
    "scheduledAt" timestamp(3) without time zone,
    "sentAt" timestamp(3) without time zone,
    "readAt" timestamp(3) without time zone,
    "responseReceived" boolean DEFAULT false NOT NULL,
    "responseContent" text,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "aiGenerated" boolean DEFAULT true NOT NULL,
    "personalizationFactors" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PersonalizedFollowUp" OWNER TO "user";

--
-- Name: PersonalizedRecommendation; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."PersonalizedRecommendation" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "stylistId" text,
    "recommendationType" text NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    "recommendedStyle" text,
    "recommendedColor" text,
    "recommendedService" text,
    "recommendedProducts" text[],
    reasoning text,
    "personalizationFactors" jsonb,
    confidence double precision,
    "customerMatchScore" double precision,
    "stylistMatchScore" double precision,
    "aiGenerated" boolean DEFAULT true NOT NULL,
    "fullExplanation" text,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "presentedAt" timestamp(3) without time zone,
    "acceptedAt" timestamp(3) without time zone,
    "rejectedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PersonalizedRecommendation" OWNER TO "user";

--
-- Name: PointsTransaction; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."PointsTransaction" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "membershipId" text NOT NULL,
    "transactionType" text NOT NULL,
    points double precision NOT NULL,
    source text,
    "sourceId" text,
    "baseAmount" double precision,
    multiplier double precision,
    "calculatedPoints" double precision,
    description text,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PointsTransaction" OWNER TO "user";

--
-- Name: PorosityElasticityAnalysis; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."PorosityElasticityAnalysis" (
    id text NOT NULL,
    "customerId" text,
    "scanId" text,
    porosity text NOT NULL,
    "porosityLevel" double precision,
    elasticity text NOT NULL,
    "elasticityLevel" double precision,
    "stretchTest" jsonb,
    "proteinLevel" double precision,
    "moistureLevel" double precision,
    balance text,
    analysis text,
    "riskFactors" text[],
    recommendations text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PorosityElasticityAnalysis" OWNER TO "user";

--
-- Name: PostServiceAudit; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."PostServiceAudit" (
    id text NOT NULL,
    "bookingId" text,
    "serviceId" text,
    "staffId" text,
    "auditScore" double precision NOT NULL,
    "colorScore" double precision,
    "curlScore" double precision,
    "shineScore" double precision,
    "evennessScore" double precision,
    "aiAnalysis" text,
    strengths text[],
    improvements text[],
    "beforeImageUrl" text,
    "afterImageUrl" text,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "reviewedBy" text,
    "reviewedAt" timestamp(3) without time zone,
    "reviewNotes" text,
    "auditedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PostServiceAudit" OWNER TO "user";

--
-- Name: PricingHistory; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."PricingHistory" (
    id text NOT NULL,
    "serviceId" text NOT NULL,
    "branchId" text,
    "stylistId" text,
    "previousPrice" double precision NOT NULL,
    "newPrice" double precision NOT NULL,
    "changeAmount" double precision NOT NULL,
    "changePercent" double precision NOT NULL,
    "changeReason" text,
    "appliedRules" text[],
    "demandLevel" text,
    "trafficLevel" text,
    "changedBy" text,
    "changedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PricingHistory" OWNER TO "user";

--
-- Name: PricingOptimization; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."PricingOptimization" (
    id text NOT NULL,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    "periodType" text NOT NULL,
    "serviceId" text,
    "branchId" text,
    "currentRevenue" double precision DEFAULT 0 NOT NULL,
    "optimizedRevenue" double precision DEFAULT 0 NOT NULL,
    "revenueIncrease" double precision DEFAULT 0 NOT NULL,
    "revenueIncreasePercent" double precision DEFAULT 0 NOT NULL,
    "currentAvgPrice" double precision,
    "optimizedAvgPrice" double precision,
    "optimizationFactors" jsonb,
    recommendations jsonb,
    "expectedImpact" jsonb,
    "aiAnalysis" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PricingOptimization" OWNER TO "user";

--
-- Name: PricingRule; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."PricingRule" (
    id text NOT NULL,
    "ruleType" text NOT NULL,
    "ruleName" text NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    conditions jsonb NOT NULL,
    "adjustmentType" text NOT NULL,
    "adjustmentValue" double precision NOT NULL,
    "adjustmentDirection" text NOT NULL,
    "serviceIds" text[],
    "branchIds" text[],
    "stylistIds" text[],
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    description text,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PricingRule" OWNER TO "user";

--
-- Name: Product; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    "subCategory" text,
    unit text NOT NULL,
    "defaultUsage" integer,
    "branchAware" boolean DEFAULT true NOT NULL,
    "pricePerUnit" double precision,
    stock double precision DEFAULT 0,
    "minStock" double precision,
    "maxStock" double precision,
    "expiryDate" timestamp(3) without time zone,
    "imageUrl" text,
    notes text,
    capacity double precision,
    "capacityUnit" text,
    "supplierId" text,
    "costPrice" double precision,
    "isActive" boolean DEFAULT true NOT NULL,
    sku text
);


ALTER TABLE public."Product" OWNER TO "user";

--
-- Name: ProductCategory; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."ProductCategory" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProductCategory" OWNER TO "user";

--
-- Name: ProductStock; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."ProductStock" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "branchId" text NOT NULL,
    quantity integer NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "locationId" text
);


ALTER TABLE public."ProductStock" OWNER TO "user";

--
-- Name: ProfitCalculation; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."ProfitCalculation" (
    id text NOT NULL,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    "periodType" text NOT NULL,
    "branchId" text,
    "partnerId" text,
    "totalRevenue" double precision DEFAULT 0 NOT NULL,
    "totalCOGS" double precision DEFAULT 0 NOT NULL,
    "operatingExpenses" double precision DEFAULT 0 NOT NULL,
    "grossProfit" double precision DEFAULT 0 NOT NULL,
    "grossMargin" double precision,
    "operatingProfit" double precision DEFAULT 0 NOT NULL,
    "operatingMargin" double precision,
    "netProfit" double precision DEFAULT 0 NOT NULL,
    "netMargin" double precision,
    ebitda double precision,
    "breakEvenPoint" double precision,
    "expenseBreakdown" jsonb,
    "revenueBreakdown" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProfitCalculation" OWNER TO "user";

--
-- Name: QualityScore; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."QualityScore" (
    id text NOT NULL,
    "bookingId" text,
    "serviceId" text,
    "staffId" text,
    "overallScore" double precision NOT NULL,
    "technicalScore" double precision,
    "consistencyScore" double precision,
    "timingScore" double precision,
    "productScore" double precision,
    evenness double precision,
    tension double precision,
    "productAmount" double precision,
    spacing double precision,
    temperature double precision,
    timing double precision,
    "aiAnalysis" text,
    strengths text[],
    weaknesses text[],
    "capturedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."QualityScore" OWNER TO "user";

--
-- Name: Reminder; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Reminder" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    type text NOT NULL,
    "sendAt" timestamp(3) without time zone NOT NULL,
    sent boolean DEFAULT false NOT NULL,
    "sentAt" timestamp(3) without time zone,
    channel text DEFAULT 'zalo'::text NOT NULL,
    message text NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Reminder" OWNER TO "user";

--
-- Name: RestockRecommendation; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."RestockRecommendation" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "projectionId" text,
    "currentStock" double precision NOT NULL,
    "safetyStock" double precision,
    "daysUntilEmpty" double precision,
    "recommendedQty" double precision NOT NULL,
    "recommendedUnit" text,
    "estimatedCost" double precision,
    priority text NOT NULL,
    reason text,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "approvedBy" text,
    "approvedAt" timestamp(3) without time zone,
    "orderedAt" timestamp(3) without time zone,
    "receivedAt" timestamp(3) without time zone,
    "budgetCategory" text,
    "canDefer" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."RestockRecommendation" OWNER TO "user";

--
-- Name: RestockTrigger; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."RestockTrigger" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "triggerType" text NOT NULL,
    severity text NOT NULL,
    "currentStock" double precision NOT NULL,
    threshold double precision,
    message text,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "acknowledgedAt" timestamp(3) without time zone,
    "resolvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."RestockTrigger" OWNER TO "user";

--
-- Name: Revenue; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Revenue" (
    id text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    amount double precision NOT NULL,
    source text NOT NULL,
    "paymentMethod" text,
    currency text DEFAULT 'VND'::text NOT NULL,
    "branchId" text,
    "partnerId" text,
    "customerId" text,
    "staffId" text,
    "serviceId" text,
    "invoiceId" text,
    "bookingId" text,
    "productId" text,
    description text,
    notes text,
    "receiptUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Revenue" OWNER TO "user";

--
-- Name: RewardCatalog; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."RewardCatalog" (
    id text NOT NULL,
    "rewardName" text NOT NULL,
    "rewardType" text NOT NULL,
    "rewardValue" double precision,
    "pointsRequired" double precision NOT NULL,
    "eligibleTiers" text[],
    description text,
    "imageUrl" text,
    "maxRedemptions" integer,
    "maxTotal" integer,
    "currentRedemptions" integer DEFAULT 0 NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."RewardCatalog" OWNER TO "user";

--
-- Name: RewardRedemption; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."RewardRedemption" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "membershipId" text NOT NULL,
    "rewardId" text NOT NULL,
    "pointsUsed" double precision NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "bookingId" text,
    "serviceId" text,
    "usedAt" timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."RewardRedemption" OWNER TO "user";

--
-- Name: RoleplaySession; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."RoleplaySession" (
    id text NOT NULL,
    "userId" text NOT NULL,
    role text NOT NULL,
    scenario text NOT NULL,
    persona text NOT NULL,
    messages jsonb NOT NULL,
    score integer,
    assessment jsonb,
    feedback jsonb,
    status text DEFAULT 'active'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."RoleplaySession" OWNER TO "user";

--
-- Name: SOP; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."SOP" (
    id text NOT NULL,
    step integer NOT NULL,
    title text NOT NULL,
    detail jsonb NOT NULL,
    role text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SOP" OWNER TO "user";

--
-- Name: SOPEnforcement; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."SOPEnforcement" (
    id text NOT NULL,
    "partnerId" text,
    "branchId" text,
    "sopId" text,
    "sopVersion" text,
    "enforcementLevel" text DEFAULT 'REQUIRED'::text NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "effectiveDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiryDate" timestamp(3) without time zone,
    monitored boolean DEFAULT true NOT NULL,
    "violationsCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SOPEnforcement" OWNER TO "user";

--
-- Name: SalaryPayout; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."SalaryPayout" (
    id text NOT NULL,
    "staffId" text NOT NULL,
    "branchId" text NOT NULL,
    month text NOT NULL,
    "totalSalary" integer NOT NULL,
    breakdown jsonb NOT NULL,
    "generatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SalaryPayout" OWNER TO "user";

--
-- Name: SalesFunnel; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."SalesFunnel" (
    id text NOT NULL,
    "customerId" text,
    "funnelStage" text NOT NULL,
    "entryPoint" text,
    "currentService" text,
    "currentProduct" text,
    "stepsCompleted" text[],
    "currentStep" text,
    "automationActive" boolean DEFAULT true NOT NULL,
    "nextAction" text,
    "nextActionDate" timestamp(3) without time zone,
    "timeInFunnel" integer,
    "conversionProbability" double precision,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SalesFunnel" OWNER TO "user";

--
-- Name: ScalpConditionAnalysis; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."ScalpConditionAnalysis" (
    id text NOT NULL,
    "customerId" text,
    "scalpType" text,
    dandruff text,
    "dandruffType" text,
    "fungalInfection" boolean,
    inflammation boolean,
    "rootStrength" double precision,
    "hairLoss" text,
    analysis text,
    issues text[],
    recommendations text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ScalpConditionAnalysis" OWNER TO "user";

--
-- Name: Service; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Service" (
    id text NOT NULL,
    name text NOT NULL,
    code text,
    category text NOT NULL,
    description text,
    "englishName" text,
    "englishDescription" text,
    price integer NOT NULL,
    duration integer NOT NULL,
    image text,
    "isActive" boolean DEFAULT true NOT NULL,
    "allowPriceOverride" boolean DEFAULT false NOT NULL,
    "displayLocation" text,
    unit text
);


ALTER TABLE public."Service" OWNER TO "user";

--
-- Name: ServiceCost; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."ServiceCost" (
    id text NOT NULL,
    "serviceId" text NOT NULL,
    "visitId" text,
    "invoiceId" text,
    "productId" text NOT NULL,
    "quantityUsed" double precision NOT NULL,
    "unitPrice" double precision NOT NULL,
    "totalCost" double precision NOT NULL,
    "servicePrice" double precision,
    margin double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ServiceCost" OWNER TO "user";

--
-- Name: ServiceProductUsage; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."ServiceProductUsage" (
    id text NOT NULL,
    "serviceId" text NOT NULL,
    "productId" text NOT NULL,
    amount integer NOT NULL
);


ALTER TABLE public."ServiceProductUsage" OWNER TO "user";

--
-- Name: ServiceSOP; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."ServiceSOP" (
    id text NOT NULL,
    "serviceId" text,
    "serviceName" text NOT NULL,
    steps jsonb NOT NULL,
    "standardParams" jsonb,
    prerequisites text[],
    materials text[],
    "qualityStandards" jsonb,
    version text DEFAULT '1.0'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ServiceSOP" OWNER TO "user";

--
-- Name: SimulationSession; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."SimulationSession" (
    id text NOT NULL,
    "userId" text NOT NULL,
    scenario text NOT NULL,
    persona text NOT NULL,
    messages jsonb NOT NULL,
    score integer,
    feedback jsonb,
    status text DEFAULT 'active'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SimulationSession" OWNER TO "user";

--
-- Name: SkillAssessment; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."SkillAssessment" (
    id text NOT NULL,
    "staffId" text NOT NULL,
    source text NOT NULL,
    "sourceId" text,
    "scenarioType" text,
    communication integer NOT NULL,
    technical integer NOT NULL,
    "problemSolving" integer NOT NULL,
    "customerExperience" integer NOT NULL,
    upsale integer NOT NULL,
    "totalScore" integer NOT NULL,
    level text NOT NULL,
    strengths jsonb,
    improvements jsonb,
    "detailedFeedback" jsonb,
    "weaknessAnalysis" jsonb,
    recommendations jsonb,
    "assessedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "branchId" text
);


ALTER TABLE public."SkillAssessment" OWNER TO "user";

--
-- Name: SkillProgress; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."SkillProgress" (
    id text NOT NULL,
    "userId" text NOT NULL,
    skill text NOT NULL,
    score integer NOT NULL,
    source text NOT NULL,
    "refId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SkillProgress" OWNER TO "user";

--
-- Name: SmartDiscount; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."SmartDiscount" (
    id text NOT NULL,
    "discountType" text NOT NULL,
    "discountName" text NOT NULL,
    "discountValue" double precision NOT NULL,
    "discountUnit" text NOT NULL,
    "minPurchase" double precision,
    "serviceIds" text[],
    "branchIds" text[],
    "customerSegments" text[],
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    conditions jsonb,
    "usageCount" integer DEFAULT 0 NOT NULL,
    "maxUsage" integer,
    "revenueImpact" double precision,
    "aiGenerated" boolean DEFAULT false NOT NULL,
    "aiReasoning" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SmartDiscount" OWNER TO "user";

--
-- Name: Staff; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Staff" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "employeeId" text,
    "position" text,
    "hireDate" timestamp(3) without time zone,
    salary double precision,
    "commissionRate" double precision,
    specialization text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Staff" OWNER TO "user";

--
-- Name: StaffDailyRecord; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."StaffDailyRecord" (
    id text NOT NULL,
    "staffId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "checkIn" timestamp(3) without time zone,
    "checkOut" timestamp(3) without time zone,
    status public."AttendanceStatus" NOT NULL,
    notes text
);


ALTER TABLE public."StaffDailyRecord" OWNER TO "user";

--
-- Name: StaffSalaryProfile; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."StaffSalaryProfile" (
    id text NOT NULL,
    "staffId" text NOT NULL,
    "baseSalary" integer NOT NULL,
    "commissionConfig" jsonb NOT NULL,
    "kpiTargets" jsonb NOT NULL,
    penalties jsonb NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."StaffSalaryProfile" OWNER TO "user";

--
-- Name: StaffService; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."StaffService" (
    id text NOT NULL,
    "staffId" text NOT NULL,
    "serviceId" text NOT NULL
);


ALTER TABLE public."StaffService" OWNER TO "user";

--
-- Name: StaffShift; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."StaffShift" (
    id text NOT NULL,
    "staffId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "startTime" text,
    "endTime" text,
    notes text
);


ALTER TABLE public."StaffShift" OWNER TO "user";

--
-- Name: StockIssue; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."StockIssue" (
    id text NOT NULL,
    "issueNumber" text NOT NULL,
    "branchId" text NOT NULL,
    reason text NOT NULL,
    "staffId" text,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    "totalAmount" double precision DEFAULT 0 NOT NULL,
    "createdBy" text NOT NULL,
    "approvedBy" text,
    "approvedAt" timestamp(3) without time zone,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "recipientId" text,
    "recipientName" text
);


ALTER TABLE public."StockIssue" OWNER TO "user";

--
-- Name: StockIssueItem; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."StockIssueItem" (
    id text NOT NULL,
    "issueId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" double precision,
    "totalPrice" double precision,
    notes text
);


ALTER TABLE public."StockIssueItem" OWNER TO "user";

--
-- Name: StockLog; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."StockLog" (
    id text NOT NULL,
    "productId" text NOT NULL,
    type text NOT NULL,
    quantity double precision NOT NULL,
    "pricePerUnit" double precision,
    "totalCost" double precision,
    note text,
    "referenceId" text,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."StockLog" OWNER TO "user";

--
-- Name: StockReceipt; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."StockReceipt" (
    id text NOT NULL,
    "receiptNumber" text NOT NULL,
    "branchId" text NOT NULL,
    "supplierId" text,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    "totalAmount" double precision DEFAULT 0 NOT NULL,
    "createdBy" text NOT NULL,
    "approvedBy" text,
    "approvedAt" timestamp(3) without time zone,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "discountPercent" double precision DEFAULT 0,
    "finalAmount" double precision DEFAULT 0 NOT NULL,
    "importType" text,
    "totalDiscount" double precision DEFAULT 0 NOT NULL
);


ALTER TABLE public."StockReceipt" OWNER TO "user";

--
-- Name: StockReceiptItem; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."StockReceiptItem" (
    id text NOT NULL,
    "receiptId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" double precision NOT NULL,
    "totalPrice" double precision NOT NULL,
    notes text,
    "discountAmount" double precision DEFAULT 0,
    "discountPercent" double precision DEFAULT 0
);


ALTER TABLE public."StockReceiptItem" OWNER TO "user";

--
-- Name: StockTransaction; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."StockTransaction" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "branchId" text NOT NULL,
    type text NOT NULL,
    quantity integer NOT NULL,
    reason text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "referenceId" text
);


ALTER TABLE public."StockTransaction" OWNER TO "user";

--
-- Name: StockTransfer; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."StockTransfer" (
    id text NOT NULL,
    "transferNumber" text NOT NULL,
    "fromBranchId" text NOT NULL,
    "toBranchId" text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "createdBy" text NOT NULL,
    "completedBy" text,
    "completedAt" timestamp(3) without time zone,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."StockTransfer" OWNER TO "user";

--
-- Name: StockTransferItem; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."StockTransferItem" (
    id text NOT NULL,
    "transferId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    "costPrice" double precision,
    notes text
);


ALTER TABLE public."StockTransferItem" OWNER TO "user";

--
-- Name: StyleMatching; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."StyleMatching" (
    id text NOT NULL,
    "customerId" text,
    "personalStyle" text NOT NULL,
    "styleTags" text[],
    vibe text,
    "matchedStyles" text[],
    "matchedColors" text[],
    confidence double precision,
    "styleAnalysis" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."StyleMatching" OWNER TO "user";

--
-- Name: StylistAnalysis; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."StylistAnalysis" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "hairCondition" text NOT NULL,
    "hairHistory" text NOT NULL,
    "customerGoal" text NOT NULL,
    "curlType" text NOT NULL,
    "hairDamageLevel" text NOT NULL,
    "stylistNote" text NOT NULL,
    "resultJson" jsonb NOT NULL
);


ALTER TABLE public."StylistAnalysis" OWNER TO "user";

--
-- Name: StylistSignatureStyle; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."StylistSignatureStyle" (
    id text NOT NULL,
    "staffId" text NOT NULL,
    specialties text[],
    "preferredCurlSize" text[],
    "preferredColorTones" text[],
    "preferredTechniques" text[],
    "signatureStyle" text,
    "styleStrength" jsonb,
    "typicalResults" jsonb,
    "averageRating" double precision,
    "customerSatisfaction" double precision,
    "commonFormulas" jsonb,
    "successfulStyles" jsonb,
    "preferredSettings" jsonb,
    "servicesCount" integer DEFAULT 0 NOT NULL,
    "lastAnalyzed" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."StylistSignatureStyle" OWNER TO "user";

--
-- Name: StylistSupportPanel; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."StylistSupportPanel" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "bookingId" text,
    "faceAnalysisId" text,
    "hairConditionId" text,
    "hairstyleRecId" text,
    "colorRecId" text,
    "supportData" jsonb NOT NULL,
    "faceShape" text,
    "hairCondition" text,
    "recommendedStyle" text,
    "recommendedColor" text,
    "productGuide" jsonb,
    "formulaGuide" jsonb,
    settings jsonb,
    warnings text[],
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."StylistSupportPanel" OWNER TO "user";

--
-- Name: Supplier; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Supplier" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "contactName" text,
    phone text,
    email text,
    address text,
    city text,
    province text,
    country text DEFAULT 'VN'::text,
    "taxCode" text,
    website text,
    "paymentTerms" text,
    notes text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Supplier" OWNER TO "user";

--
-- Name: TechnicalChecklist; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."TechnicalChecklist" (
    id text NOT NULL,
    "serviceId" text,
    "serviceName" text,
    "bookingId" text,
    items jsonb NOT NULL,
    "completedItems" text[],
    "pendingItems" text[],
    "skippedItems" text[],
    "completionRate" double precision,
    "isCompleted" boolean DEFAULT false NOT NULL,
    "aiVerified" boolean DEFAULT false NOT NULL,
    "aiWarnings" text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TechnicalChecklist" OWNER TO "user";

--
-- Name: ThresholdRule; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."ThresholdRule" (
    id text NOT NULL,
    "productId" text,
    "productCategory" text,
    "serviceId" text,
    "serviceCategory" text,
    "normalMin" double precision,
    "normalMax" double precision,
    "warningMin" double precision,
    "warningMax" double precision,
    "alertMin" double precision,
    "alertMax" double precision,
    "criticalMin" double precision,
    "expectedMin" double precision,
    "expectedMax" double precision,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ThresholdRule" OWNER TO "user";

--
-- Name: TierUpgradeHistory; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."TierUpgradeHistory" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "membershipId" text NOT NULL,
    "previousTier" text NOT NULL,
    "newTier" text NOT NULL,
    "changeType" text NOT NULL,
    reason text,
    "triggerType" text,
    criteria jsonb,
    "spendingAtChange" double precision,
    "visitsAtChange" integer,
    "pointsAtChange" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TierUpgradeHistory" OWNER TO "user";

--
-- Name: TrainingExercise; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."TrainingExercise" (
    id text NOT NULL,
    "lessonId" text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    content jsonb NOT NULL,
    answer jsonb,
    points integer DEFAULT 10 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TrainingExercise" OWNER TO "user";

--
-- Name: TrainingLesson; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."TrainingLesson" (
    id text NOT NULL,
    "moduleId" text NOT NULL,
    title text NOT NULL,
    content jsonb,
    "order" integer NOT NULL,
    role text,
    level integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TrainingLesson" OWNER TO "user";

--
-- Name: TrainingLevel; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."TrainingLevel" (
    id text NOT NULL,
    "roleId" text NOT NULL,
    level integer NOT NULL,
    name text NOT NULL,
    description text,
    requirements jsonb,
    modules text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TrainingLevel" OWNER TO "user";

--
-- Name: TrainingModule; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."TrainingModule" (
    id text NOT NULL,
    title text NOT NULL,
    "desc" text,
    "order" integer NOT NULL,
    category text,
    role text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TrainingModule" OWNER TO "user";

--
-- Name: TrainingProgress; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."TrainingProgress" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "levelId" text NOT NULL,
    "moduleId" text,
    "lessonId" text,
    status text DEFAULT 'not_started'::text NOT NULL,
    score integer,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TrainingProgress" OWNER TO "user";

--
-- Name: TrainingQuiz; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."TrainingQuiz" (
    id text NOT NULL,
    "lessonId" text NOT NULL,
    questions jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TrainingQuiz" OWNER TO "user";

--
-- Name: TrainingQuizResult; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."TrainingQuizResult" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "quizId" text NOT NULL,
    score integer NOT NULL,
    total integer NOT NULL,
    answers jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TrainingQuizResult" OWNER TO "user";

--
-- Name: TrainingRole; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."TrainingRole" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TrainingRole" OWNER TO "user";

--
-- Name: TreatmentPlan; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."TreatmentPlan" (
    id text NOT NULL,
    "customerId" text,
    "scanId" text,
    "damageAssessmentId" text,
    "porosityAnalysisId" text,
    "chemicalRiskId" text,
    "scalpAnalysisId" text,
    "planType" text NOT NULL,
    duration integer,
    "immediateTreatment" jsonb,
    "weeklyPlan" jsonb,
    "homecarePlan" jsonb,
    "permSuitability" text,
    "colorSuitability" text,
    "bleachSuitability" text,
    products text[],
    "expectedHealthScore" double precision,
    "expectedImprovement" double precision,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "startedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "isAIGenerated" boolean DEFAULT true NOT NULL,
    confidence double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TreatmentPlan" OWNER TO "user";

--
-- Name: TreatmentTracking; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."TreatmentTracking" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "treatmentPlanId" text,
    "weekNumber" integer,
    "healthScore" double precision NOT NULL,
    "previousScore" double precision,
    improvement double precision,
    "damageReduction" double precision,
    "treatmentsDone" jsonb,
    "productsUsed" text[],
    notes text,
    "customerFeedback" text,
    "aiAssessment" text,
    "trackedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TreatmentTracking" OWNER TO "user";

--
-- Name: UpsaleMatrix; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."UpsaleMatrix" (
    id text NOT NULL,
    "serviceId" text,
    "serviceName" text NOT NULL,
    "recommendedServices" text[],
    "recommendedProducts" text[],
    "upsaleType" text NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    "conversionRate" double precision,
    conditions jsonb,
    script text,
    benefits text[],
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UpsaleMatrix" OWNER TO "user";

--
-- Name: UpsaleRecommendation; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."UpsaleRecommendation" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "serviceId" text,
    "invoiceId" text,
    "recommendedServices" text[],
    "recommendedProducts" text[],
    combo jsonb,
    "isAIGenerated" boolean DEFAULT true NOT NULL,
    confidence double precision,
    reason text,
    script text,
    tone text,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "acceptedItems" text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UpsaleRecommendation" OWNER TO "user";

--
-- Name: UpsaleRecord; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."UpsaleRecord" (
    id text NOT NULL,
    "invoiceId" text NOT NULL,
    "customerId" text NOT NULL,
    "staffId" text,
    "originalAmount" double precision NOT NULL,
    "upsaleAmount" double precision NOT NULL,
    "totalAmount" double precision NOT NULL,
    "originalItems" text[],
    "upsaleItems" text[],
    source text NOT NULL,
    "recommendationId" text,
    "upsaleRate" double precision,
    "conversionType" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."UpsaleRecord" OWNER TO "user";

--
-- Name: User; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "partnerId" text,
    name text NOT NULL,
    "trainingRole" text,
    "currentLevel" integer,
    phone text NOT NULL,
    password text NOT NULL,
    role public."UserRole" NOT NULL,
    "branchId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO "user";

--
-- Name: VideoFrame; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."VideoFrame" (
    id text NOT NULL,
    "videoId" text NOT NULL,
    "frameNumber" integer NOT NULL,
    "timestamp" double precision NOT NULL,
    "imageUrl" text NOT NULL,
    analyzed boolean DEFAULT false NOT NULL,
    "analysisData" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."VideoFrame" OWNER TO "user";

--
-- Name: Visit; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Visit" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    service text NOT NULL,
    stylist text,
    assistant text,
    technical jsonb,
    "productsUsed" jsonb,
    "totalCharge" integer,
    "photosBefore" text[],
    "photosAfter" text[],
    rating integer,
    "followUpNotes" text,
    notes text,
    tags text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Visit" OWNER TO "user";

--
-- Name: VoiceAnalytics; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."VoiceAnalytics" (
    id text NOT NULL,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    "periodType" text NOT NULL,
    "totalSessions" integer DEFAULT 0 NOT NULL,
    "totalInteractions" integer DEFAULT 0 NOT NULL,
    "avgDuration" double precision,
    "avgInteractions" double precision,
    "intentCounts" jsonb,
    "resolutionRate" double precision,
    "bookingRate" double precision,
    "avgSentiment" double precision,
    "positiveRate" double precision,
    "satisfactionScore" double precision,
    "totalCalls" integer DEFAULT 0 NOT NULL,
    "avgCallDuration" double precision,
    "transferRate" double precision,
    "totalCommands" integer DEFAULT 0 NOT NULL,
    "commandSuccessRate" double precision,
    "branchId" text,
    "partnerId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."VoiceAnalytics" OWNER TO "user";

--
-- Name: VoiceCommand; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."VoiceCommand" (
    id text NOT NULL,
    "staffId" text NOT NULL,
    "branchId" text,
    "audioUrl" text,
    transcript text NOT NULL,
    "commandType" text NOT NULL,
    parameters jsonb,
    intent text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    result jsonb,
    error text,
    "responseText" text,
    "responseAudioUrl" text,
    "executedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."VoiceCommand" OWNER TO "user";

--
-- Name: VoiceIntent; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."VoiceIntent" (
    id text NOT NULL,
    intent text NOT NULL,
    confidence double precision NOT NULL,
    "sessionId" text,
    "interactionId" text,
    entities jsonb,
    resolved boolean DEFAULT false NOT NULL,
    "resolutionAction" text,
    "bookingId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."VoiceIntent" OWNER TO "user";

--
-- Name: VoiceInteraction; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."VoiceInteraction" (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    sequence integer NOT NULL,
    speaker text NOT NULL,
    "audioUrl" text,
    transcript text NOT NULL,
    language text DEFAULT 'vi'::text,
    intent text,
    entities jsonb,
    sentiment text,
    emotion text,
    "responseText" text,
    "responseAudioUrl" text,
    "responseStyle" text,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    duration double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."VoiceInteraction" OWNER TO "user";

--
-- Name: VoiceSession; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."VoiceSession" (
    id text NOT NULL,
    "sessionType" text NOT NULL,
    channel text,
    "customerId" text,
    "customerPhone" text,
    "customerName" text,
    "staffId" text,
    "branchId" text,
    "partnerId" text,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endedAt" timestamp(3) without time zone,
    duration integer,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    summary text,
    intent text,
    resolved boolean DEFAULT false NOT NULL,
    "actionTaken" text,
    "callId" text,
    "callDirection" text,
    "transferToHuman" boolean DEFAULT false NOT NULL,
    "transferReason" text,
    "recordingUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VoiceSession" OWNER TO "user";

--
-- Name: WorkflowError; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."WorkflowError" (
    id text NOT NULL,
    type text NOT NULL,
    input jsonb NOT NULL,
    error text NOT NULL,
    "rawOutput" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."WorkflowError" OWNER TO "user";

--
-- Name: WorkflowRun; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."WorkflowRun" (
    id text NOT NULL,
    type text NOT NULL,
    input jsonb NOT NULL,
    output jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."WorkflowRun" OWNER TO "user";

--
-- Name: _MarketingCampaignToMarketingChannel; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."_MarketingCampaignToMarketingChannel" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_MarketingCampaignToMarketingChannel" OWNER TO "user";

--
-- Data for Name: AbandonedCart; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."AbandonedCart" (id, "customerId", phone, "abandonmentType", "originalIntent", "recoveryAttempts", "lastAttempt", "nextAttempt", status, metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AutomationFlow; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."AutomationFlow" (id, name, description, trigger, conditions, actions, active, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AutomationLog; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."AutomationLog" (id, "flowId", "customerId", action, result, metadata, error, "createdAt") FROM stdin;
\.


--
-- Data for Name: Booking; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Booking" (id, "customerId", "branchId", "stylistId", "serviceId", date, status, notes) FROM stdin;
b6aed0da-7d42-44c7-a331-47b3bbac292f	5c07cefe-2407-4130-94eb-af25573a29e0	cmj0bs16u00001atx0vzfjs5n	\N	\N	2025-12-12 02:00:00	CONFIRMED	Booking mẫu 1
609034c3-42db-46fa-a548-417bf6b9a88d	eb26148b-f8a6-4ab8-a05b-485a20bff123	cmj0bs16u00001atx0vzfjs5n	\N	\N	2025-12-12 03:15:00	CONFIRMED	Booking mẫu 2
6c15e398-5838-48ae-a469-d97d0c358be2	3041e3d8-2e59-4229-9eae-5015d60cd788	cmj0bs16u00001atx0vzfjs5n	\N	\N	2025-12-12 04:30:00	CONFIRMED	Booking mẫu 3
3a2cf873-c4a7-4c04-a3b8-3201c3a0f662	f0b63227-3a7c-42d7-b77f-be726eb604c2	cmj0bs16u00001atx0vzfjs5n	\N	\N	2025-12-11 05:45:00	CONFIRMED	Booking mẫu 4
02ac5738-f4d0-4876-8568-10f31127be39	9221c1be-5a0b-4f9d-9980-38e021b623cc	cmj0bs16u00001atx0vzfjs5n	\N	\N	2025-12-11 06:00:00	CONFIRMED	Booking mẫu 5
1386e066-a0a9-4f05-8943-4aad8c354ad4	1375a00d-a496-44c8-90db-6e72eb37be9f	cmj0bs16u00001atx0vzfjs5n	\N	\N	2025-12-11 07:15:00	COMPLETED	Booking mẫu 6
28e1f552-17f9-42f1-8b8b-9ed7f0ff097e	176e1689-1fed-40ec-9517-a59e0629afc3	cmj0bs16u00001atx0vzfjs5n	\N	\N	2025-12-10 08:30:00	COMPLETED	Booking mẫu 7
fb31b218-4f94-40e3-8746-88355fd17f3c	d103fa6d-00b8-4555-a5fc-9e3f5b61a235	cmj0bs16u00001atx0vzfjs5n	\N	\N	2025-12-10 09:45:00	COMPLETED	Booking mẫu 8
7a20ee8d-a936-47a6-8d39-ae9fb74766da	9e91eca8-b316-4a5e-84f1-9d724cb21ce5	cmj0bs16u00001atx0vzfjs5n	\N	\N	2025-12-10 02:00:00	COMPLETED	Booking mẫu 9
eb23888d-ef07-4484-aa30-caa1120dacd9	62f6c615-535a-4ac9-8441-f227a36edcdf	cmj0bs16u00001atx0vzfjs5n	\N	\N	2025-12-09 03:15:00	COMPLETED	Booking mẫu 10
ebc6df17-d29a-408b-9a16-c86e237e11c7	7dc2a305-d8d9-4ed2-9143-521d2717a174	cmj0bs16u00001atx0vzfjs5n	\N	\N	2025-12-09 04:30:00	CANCELLED	Booking mẫu 11
1114bd30-b96a-415b-b9d0-e9913cdf7d96	eb439077-4c63-46dc-ae1f-1a324db791c6	cmj0bs16u00001atx0vzfjs5n	\N	\N	2025-12-09 05:45:00	CANCELLED	Booking mẫu 12
e1c037c2-c151-4135-b2a3-4ee76ee11325	0ea8926e-d49a-451f-911f-33ee5d17abbd	cmj0bs16u00001atx0vzfjs5n	\N	\N	2025-12-08 06:00:00	CANCELLED	Booking mẫu 13
101fdd14-eba4-44d9-835a-e5853688443d	e8c5ea5a-95a3-4f41-aee1-5c2a4e29e11e	cmj0bs16u00001atx0vzfjs5n	\N	\N	2025-12-08 07:15:00	CANCELLED	Booking mẫu 14
003be176-7e4b-4584-a5f1-b8521d8c2ba0	0b33dd62-5e5e-4487-95ab-d4ea8c5467bb	cmj0bs16u00001atx0vzfjs5n	\N	\N	2025-12-08 08:30:00	CANCELLED	Booking mẫu 15
\.


--
-- Data for Name: Branch; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Branch" (id, "partnerId", name, code, address, phone, email, "managerId", "isActive", timezone, currency, metadata, "createdAt", "updatedAt") FROM stdin;
cmj0bs16u00001atx0vzfjs5n	\N	Chi nhánh mặc định	\N	123 Đường ABC, Quận 1, TP.HCM	0901234567	contact@salon.com	\N	t	Asia/Ho_Chi_Minh	VND	\N	2025-12-10 18:10:58.183	2025-12-10 18:10:58.183
\.


--
-- Data for Name: BranchForecast; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."BranchForecast" (id, "branchId", "forecastDate", "forecastType", "predictedValue", confidence, factors, "aiAnalysis", recommendations, status, "createdAt") FROM stdin;
\.


--
-- Data for Name: BranchInventory; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."BranchInventory" (id, "branchId", "productId", stock, "reservedStock", "safetyStock", "reorderPoint", "lastUpdated") FROM stdin;
\.


--
-- Data for Name: BranchPerformance; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."BranchPerformance" (id, "branchId", "periodStart", "periodEnd", "periodType", revenue, profit, margin, "totalCustomers", "newCustomers", "returningCustomers", "returnRate", "totalServices", "avgServiceTime", "conversionRate", "productCost", "staffCost", "otherCosts", "avgQualityScore", "errorRate", "customerRating", "lossRate", "wasteAmount") FROM stdin;
\.


--
-- Data for Name: BranchStaffAssignment; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."BranchStaffAssignment" (id, "staffId", "branchId", "assignmentType", "isPrimary", schedule, "isActive", "startDate", "endDate") FROM stdin;
\.


--
-- Data for Name: COGSCalculation; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."COGSCalculation" (id, "serviceId", "bookingId", "invoiceId", "productsUsed", "totalCOGS", quantity, "cogsPerUnit", date, "branchId", "staffId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Cashflow; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Cashflow" (id, date, "totalInflow", "inflowBreakdown", "totalOutflow", "outflowBreakdown", "netCashflow", "openingBalance", "closingBalance", "branchId", "partnerId", "cashAmount", "cardAmount", "transferAmount", "eWalletAmount", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Certification; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Certification" (id, "userId", "levelId", role, level, "issuedAt", "expiresAt", metadata) FROM stdin;
\.


--
-- Data for Name: ChemicalHistoryRisk; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."ChemicalHistoryRisk" (id, "customerId", "chemicalHistory", "lastPerm", "lastColor", "lastBleach", "lastStraighten", "lastTreatment", "permFrequency", "colorFrequency", "homeDyeing", "heatStyling", "riskLevel", "riskScore", "riskFactors", "cumulativeDamage", "safeToPerm", "safeToColor", "safeToBleach", recommendations, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ColorAnalysis; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."ColorAnalysis" (id, "imageId", "baseLevel", "baseTone", "baseColor", "midLevel", "midTone", "midColor", "endLevel", "endTone", "endColor", "hasHighlights", "highlightLevel", "highlightTone", "highlightColor", "highlightDistribution", undertone, saturation, lightness, "overallColorDesc", technique, "aiDescription", confidence, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ColorRecommendation; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."ColorRecommendation" (id, "customerId", "faceAnalysisId", "hairConditionId", "skinTone", "skinToneLevel", undertone, "eyeColor", "personalStyle", "recommendedColor", "colorCategory", "colorCode", "baseColor", technique, developer, reasons, benefits, warnings, alternatives, confidence, "matchScore", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CommissionRecord; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."CommissionRecord" (id, "staffId", "invoiceId", "serviceId", "productId", amount, "createdAt") FROM stdin;
\.


--
-- Data for Name: CompetitorAnalysis; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."CompetitorAnalysis" (id, "competitorName", location, "servicePrices", services, "activeCampaigns", promotions, strengths, weaknesses, opportunities, "analyzedAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ConsistencyMetrics; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."ConsistencyMetrics" (id, "staffId", "serviceId", "periodStart", "periodEnd", "avgSetting", "avgProductAmount", "avgTiming", "avgQualityScore", "teamAvgSetting", "teamAvgQuality", "consistencyScore", deviation, analysis, recommendations, "createdAt") FROM stdin;
\.


--
-- Data for Name: ConsumptionTracking; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."ConsumptionTracking" (id, "productId", date, "quantityUsed", "serviceCount", "peakUsage", "lowUsage", "topStaffId") FROM stdin;
\.


--
-- Data for Name: ContentLibrary; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."ContentLibrary" (id, type, topic, content, cta, platform, style, tags, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CorrectionSuggestion; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."CorrectionSuggestion" (id, "errorId", "bookingId", suggestion, action, priority, status, "appliedAt", "isAIGenerated", confidence, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CrossBranchQuality; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."CrossBranchQuality" (id, "periodStart", "periodEnd", "branchMetrics", "avgQuality", "bestBranch", "worstBranch", analysis, recommendations, "createdAt") FROM stdin;
\.


--
-- Data for Name: CurlPatternAnalysis; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."CurlPatternAnalysis" (id, "imageId", "curlPattern", "curlPatternDesc", bounce, density, "curlDirection", "curlSize", "curlTightness", "curlDistribution", "aiDescription", confidence, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Customer; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Customer" (id, name, phone, birthday, gender, avatar, notes, "riskLevel", "preferredStylist", "totalSpent", "totalVisits", "journeyState", "createdAt", "updatedAt") FROM stdin;
5c07cefe-2407-4130-94eb-af25573a29e0	Khách Hàng 1	09000000001	\N	MALE	\N	\N	\N	\N	0	0	AWARENESS	2025-12-12 14:45:14.547	2025-12-12 14:45:14.547
eb26148b-f8a6-4ab8-a05b-485a20bff123	Khách Hàng 2	09000000002	\N	FEMALE	\N	\N	\N	\N	0	0	AWARENESS	2025-12-12 14:45:14.556	2025-12-12 14:45:14.556
3041e3d8-2e59-4229-9eae-5015d60cd788	Khách Hàng 3	09000000003	\N	MALE	\N	\N	\N	\N	0	0	AWARENESS	2025-12-12 14:45:14.557	2025-12-12 14:45:14.557
f0b63227-3a7c-42d7-b77f-be726eb604c2	Khách Hàng 4	09000000004	\N	FEMALE	\N	\N	\N	\N	0	0	AWARENESS	2025-12-12 14:45:14.559	2025-12-12 14:45:14.559
9221c1be-5a0b-4f9d-9980-38e021b623cc	Khách Hàng 5	09000000005	\N	MALE	\N	\N	\N	\N	0	0	AWARENESS	2025-12-12 14:45:14.56	2025-12-12 14:45:14.56
1375a00d-a496-44c8-90db-6e72eb37be9f	Khách Hàng 6	09000000006	\N	FEMALE	\N	\N	\N	\N	0	0	AWARENESS	2025-12-12 14:45:14.561	2025-12-12 14:45:14.561
176e1689-1fed-40ec-9517-a59e0629afc3	Khách Hàng 7	09000000007	\N	MALE	\N	\N	\N	\N	0	0	AWARENESS	2025-12-12 14:45:14.562	2025-12-12 14:45:14.562
d103fa6d-00b8-4555-a5fc-9e3f5b61a235	Khách Hàng 8	09000000008	\N	FEMALE	\N	\N	\N	\N	0	0	AWARENESS	2025-12-12 14:45:14.563	2025-12-12 14:45:14.563
9e91eca8-b316-4a5e-84f1-9d724cb21ce5	Khách Hàng 9	09000000009	\N	MALE	\N	\N	\N	\N	0	0	AWARENESS	2025-12-12 14:45:14.564	2025-12-12 14:45:14.564
62f6c615-535a-4ac9-8441-f227a36edcdf	Khách Hàng 10	09000000010	\N	FEMALE	\N	\N	\N	\N	0	0	AWARENESS	2025-12-12 14:45:14.565	2025-12-12 14:45:14.565
7dc2a305-d8d9-4ed2-9143-521d2717a174	Khách Hàng 11	09000000011	\N	MALE	\N	\N	\N	\N	0	0	AWARENESS	2025-12-12 14:45:14.566	2025-12-12 14:45:14.566
eb439077-4c63-46dc-ae1f-1a324db791c6	Khách Hàng 12	09000000012	\N	FEMALE	\N	\N	\N	\N	0	0	AWARENESS	2025-12-12 14:45:14.567	2025-12-12 14:45:14.567
0ea8926e-d49a-451f-911f-33ee5d17abbd	Khách Hàng 13	09000000013	\N	MALE	\N	\N	\N	\N	0	0	AWARENESS	2025-12-12 14:45:14.568	2025-12-12 14:45:14.568
e8c5ea5a-95a3-4f41-aee1-5c2a4e29e11e	Khách Hàng 14	09000000014	\N	FEMALE	\N	\N	\N	\N	0	0	AWARENESS	2025-12-12 14:45:14.569	2025-12-12 14:45:14.569
0b33dd62-5e5e-4487-95ab-d4ea8c5467bb	Khách Hàng 15	09000000015	\N	MALE	\N	\N	\N	\N	0	0	AWARENESS	2025-12-12 14:45:14.57	2025-12-12 14:45:14.57
be6b3cba-56cc-45f1-8849-23e7d9017a46	Khách Hàng 16	09000000016	\N	FEMALE	\N	\N	\N	\N	0	0	AWARENESS	2025-12-12 14:45:14.571	2025-12-12 14:45:14.571
5a2d09d4-a6d9-4879-927d-23a0dd68ef01	Khách Hàng 17	09000000017	\N	MALE	\N	\N	\N	\N	0	0	AWARENESS	2025-12-12 14:45:14.571	2025-12-12 14:45:14.571
e2da17d3-1dc2-453d-88f6-725a44a98a47	Khách Hàng 18	09000000018	\N	FEMALE	\N	\N	\N	\N	0	0	AWARENESS	2025-12-12 14:45:14.572	2025-12-12 14:45:14.572
a795466e-b382-4a75-b034-9c6b4a854122	Khách Hàng 19	09000000019	\N	MALE	\N	\N	\N	\N	0	0	AWARENESS	2025-12-12 14:45:14.573	2025-12-12 14:45:14.573
69b0c6c8-5504-44a0-ac2b-6a5380397ea1	Khách Hàng 20	09000000020	\N	FEMALE	\N	\N	\N	\N	0	0	AWARENESS	2025-12-12 14:45:14.573	2025-12-12 14:45:14.573
\.


--
-- Data for Name: CustomerBehavior; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."CustomerBehavior" (id, "customerId", "behaviorType", "behaviorData", confidence, "totalSpent", "visitCount", "averageSpend", "favoriteService", "visitFrequency", "lastVisit", "nextPredictedVisit", "preferredStylist", "preferredTime", "preferredDay", "lifetimeValue", "predictedValue", "aiAnalysis", tags, "updatedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: CustomerExperience; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."CustomerExperience" (id, "customerId", "serviceId", "visitId", "consultationScore", "technicalScore", "attitudeScore", "waitTimeScore", "valueScore", "careScore", "overallScore", strengths, improvements, feedback, "aiAnalysis", sentiment, "createdAt") FROM stdin;
\.


--
-- Data for Name: CustomerInsight; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."CustomerInsight" (id, "customerId", "churnRisk", "revisitWindow", "nextService", promotion, summary, "actionSteps", predictions, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CustomerJourney; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."CustomerJourney" (id, "customerId", "journeyStage", "stageData", touchpoint, "touchpointData", "timestamp", source, campaign, device) FROM stdin;
\.


--
-- Data for Name: CustomerLoyalty; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."CustomerLoyalty" (id, "customerId", "tierId", "totalPoints", "lifetimePts") FROM stdin;
\.


--
-- Data for Name: CustomerMembership; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."CustomerMembership" (id, "customerId", "currentTier", "totalSpending", "periodSpending", "periodStart", "periodEnd", "totalVisits", "periodVisits", "currentPoints", "lifetimePoints", "pointsRedeemed", status, "joinedAt", "tierUpgradedAt", "lastVisitAt", "expiresAt") FROM stdin;
\.


--
-- Data for Name: CustomerPersonalityProfile; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."CustomerPersonalityProfile" (id, "customerId", "curlPreference", "lengthPreference", "stylePreference", "colorPreference", "colorTonePreference", "colorIntensityPreference", "styleVibe", personality, "hairCareHabits", lifestyle, "communicationStyle", "followUpPreference", "personalitySummary", "aestheticProfile", "preferencesScore", "interactionsCount", "lastUpdated", "createdAt") FROM stdin;
\.


--
-- Data for Name: CustomerPhoto; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."CustomerPhoto" (id, "customerId", "imageUrl", description, "uploadedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CustomerPrediction; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."CustomerPrediction" (id, "customerId", "predictionType", "returnProbability", "predictedReturnDate", "predictedService", "predictedSpend", "modelVersion", confidence, factors, "createdAt", "expiresAt") FROM stdin;
\.


--
-- Data for Name: CustomerProfile; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."CustomerProfile" (id, "customerId", name, phone, "avatarUrl", "createdAt", "updatedAt", "journeyState", preferences, "hairHistory", "technicalHistory", "bookingHistory", "chatHistory", insight) FROM stdin;
\.


--
-- Data for Name: CustomerRiskAlert; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."CustomerRiskAlert" (id, "customerId", "riskType", "riskScore", severity, factors, "lastContact", "daysSinceLastVisit", "lastScore", "churnProbability", "predictedChurnDate", "recommendedAction", "actionTaken", status, "detectedAt", "resolvedAt") FROM stdin;
\.


--
-- Data for Name: CustomerStyleHistory; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."CustomerStyleHistory" (id, "customerId", "bookingId", "serviceId", "styleName", "styleType", "curlPattern", "colorTone", length, "customerFeedback", "likedFeatures", "dislikedFeatures", satisfaction, "returnIntent", "usedForLearning", "createdAt") FROM stdin;
\.


--
-- Data for Name: CustomerTag; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."CustomerTag" (id, "customerId", tag, category, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CustomerTouchpoint; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."CustomerTouchpoint" (id, "customerId", type, channel, "responseTime", content, outcome, metadata, "staffId", "createdAt") FROM stdin;
\.


--
-- Data for Name: DailyReport; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."DailyReport" (id, "reportDate", "totalRevenue", "totalCost", profit, margin, "totalServices", "servicesByCategory", "topServices", "totalProductCost", "productsUsed", "unusualUsage", "stockChanges", "lowStockItems", "stockWarnings", "lossAlerts", "highLossProducts", "totalLoss", "staffRevenue", "staffUsage", "topPerformers", "staffWarnings", strengths, risks, predictions, recommendations, "aiAnalysis", "emailSent", "emailSentAt", "zaloSent", "zaloSentAt", "notificationSent", "notificationSentAt", "generatedAt", "generatedBy") FROM stdin;
\.


--
-- Data for Name: DamageLevelAssessment; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."DamageLevelAssessment" (id, "customerId", "scanId", "damageLevel", "damageCategory", status, "cuticleDamage", "cortexDamage", "medullaDamage", "breakageRisk", "canPerm", "canColor", "canBleach", assessment, warnings, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: DynamicPricing; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."DynamicPricing" (id, "serviceId", "branchId", "stylistId", "basePrice", "adjustedPrice", "adjustmentAmount", "adjustmentPercent", "appliedRules", "timeSlot", "dayOfWeek", "demandLevel", "trafficLevel", "effectiveFrom", "effectiveUntil", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ErrorDetection; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."ErrorDetection" (id, "bookingId", "serviceId", "staffId", "errorType", "errorCategory", severity, location, description, "detectedAt", "detectionMethod", status, corrected, "correctedAt", "correctionNotes") FROM stdin;
\.


--
-- Data for Name: ExerciseSubmission; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."ExerciseSubmission" (id, "exerciseId", "userId", answer, score, feedback, "submittedAt") FROM stdin;
\.


--
-- Data for Name: Expense; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Expense" (id, date, amount, category, "subCategory", description, currency, "branchId", "partnerId", "paymentMethod", vendor, "receiptUrl", "invoiceNumber", "approvedBy", "approvedAt", status, "isRecurring", "recurringPeriod", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: FaceAnalysis; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."FaceAnalysis" (id, "customerId", "faceShape", jawline, forehead, cheekbones, chin, features, "overallVibe", "analysisData", "imageUrl", "isAIGenerated", confidence, recommendations, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: FinancialForecast; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."FinancialForecast" (id, "forecastDate", "periodStart", "periodEnd", "periodType", "forecastRevenue", "forecastExpenses", "forecastProfit", "forecastBreakdown", confidence, factors, assumptions, "branchId", "partnerId", "aiAnalysis", recommendations, "createdAt") FROM stdin;
\.


--
-- Data for Name: FinancialMetric; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."FinancialMetric" (id, "periodStart", "periodEnd", "periodType", "totalRevenue", "totalExpenses", "totalCOGS", "grossProfit", "netProfit", "grossMargin", "netMargin", "avgTransactionValue", "customerCount", "servicesCount", "branchId", "partnerId", "createdAt") FROM stdin;
\.


--
-- Data for Name: FinancialRiskAlert; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."FinancialRiskAlert" (id, "alertType", severity, title, message, "currentValue", "previousValue", "changePercent", "branchId", "partnerId", "periodStart", "periodEnd", recommendations, status, "acknowledgedBy", "acknowledgedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: FollowUpMessage; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."FollowUpMessage" (id, "customerId", phone, "ruleId", "messageType", message, "scheduledFor", "sentAt", status, channel, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: HQNotification; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."HQNotification" (id, "partnerId", type, priority, title, message, "actionUrl", status, "sentAt", "readAt", recipients, "createdAt") FROM stdin;
\.


--
-- Data for Name: HairAnalysisVideo; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."HairAnalysisVideo" (id, "videoUrl", "thumbnailUrl", "videoType", duration, "frameCount", fps, resolution, "fileSize", "mimeType", "customerId", "staffId", "branchId", "partnerId", "bookingId", "originalFileName", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: HairConditionAnalysis; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."HairConditionAnalysis" (id, "customerId", thickness, density, elasticity, "damageLevel", porosity, dryness, texture, "chemicalHistory", "lastTreatment", "lastTreatmentDate", "canPerm", "canColor", "riskLevel", recommendations, "recommendedProducts", "isAIGenerated", confidence, "analysisNotes", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: HairDamageMapping; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."HairDamageMapping" (id, "videoId", "damageZones", "overallDamage", "damageLevel", "damageTypes", "endsDamage", "midDamage", "rootDamage", "crownDamage", "sidesDamage", "endsSeverity", "midSeverity", "rootSeverity", "damageMapUrl", "aiDescription", confidence, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: HairElasticityAnalysis; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."HairElasticityAnalysis" (id, "videoId", "stretchPercent", "snapbackRate", "elasticityScore", "gumHairRisk", "breakageRisk", "damageRisk", "testType", "stretchDistance", "recoveryTime", "elasticityStatus", "aiDescription", recommendations, confidence, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: HairFormula; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."HairFormula" (id, "imageId", "formulaType", "permProduct", "permStrength", "permSetting", "permTime", "permHeat", "permSteps", "colorTubes", "colorOxy", "colorTime", "colorSteps", "preTreatment", "postTreatment", warnings, notes, "riskLevel", "riskFactors", "aiGenerated", confidence, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: HairHealthScan; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."HairHealthScan" (id, "customerId", "imageUrl", "videoUrl", "healthScore", dryness, elasticity, "damageSpots", porosity, "moistureRetention", shine, "colorEvenness", "patchyColor", "brokenStrands", "splitEnds", "whiteDots", "burnedHair", "puffyHair", "damageAtRoot", "damageAtMid", "damageAtEnd", "aiAnalysis", "detectedIssues", recommendations, "isAIGenerated", confidence, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: HairMovementAnalysis; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."HairMovementAnalysis" (id, "videoId", "movementScore", "bounceScore", "frizzScore", "fiberCohesion", "softnessScore", "movementType", "bounceLevel", "frizzLevel", "densityDistribution", "fiberInteraction", "aiDescription", confidence, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: HairProcedure; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."HairProcedure" (id, "imageId", "styleAnalysisId", "curlAnalysisId", "colorAnalysisId", "formulaId", "procedureType", "preProcedure", "mainProcedure", "postProcedure", products, "estimatedTime", aftercare, "fullSOP", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: HairSimulation; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."HairSimulation" (id, "customerId", "recommendationId", "originalImageUrl", style, color, length, "simulatedImageUrl", "simulationType", status, progress, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: HairStyleAnalysis; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."HairStyleAnalysis" (id, "imageId", "styleType", length, "lengthCm", texture, "hairThickness", "volumeTop", "volumeSide", "shineLevel", dryness, "damageLevel", porosity, "colorLevel", "baseTone", "overallColor", "existingPattern", "aiDescription", confidence, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: HairStyleImage; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."HairStyleImage" (id, "imageUrl", "imageType", "thumbnailUrl", "customerId", "staffId", "branchId", "partnerId", "originalFileName", "fileSize", "mimeType", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: HairSurfaceAnalysis; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."HairSurfaceAnalysis" (id, "videoId", "shineLevel", "porosityLevel", "drynessLevel", "lightAbsorption", "lightReflection", "colorUptake", "smoothnessScore", "roughnessScore", "surfaceCondition", "aiDescription", confidence, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: HairVideoRecommendation; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."HairVideoRecommendation" (id, "videoId", "hairHealthScore", "healthStatus", "permHotSuitable", "permColdSuitable", "permAcidSuitable", "colorLightSuitable", "colorDarkSuitable", "overallRisk", "riskFactors", "recommendedProducts", "recommendedTechniques", "treatmentPlan", "recoveryPlan", "permFormula", "colorFormula", "fullRecommendation", "aiDescription", confidence, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: HairstyleRecommendation; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."HairstyleRecommendation" (id, "customerId", "faceAnalysisId", "hairConditionId", "recommendedStyle", "styleCategory", description, "curlSize", "layerStyle", length, "recommendedProduct", "permSetting", reasons, benefits, warnings, confidence, "matchScore", "faceShapeMatch", alternatives, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: InventoryProjection; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."InventoryProjection" (id, "productId", "projectionDate", "currentStock", "safetyStock", "averageDailyUsage", "peakDailyUsage", "lowDailyUsage", "projection7Days", "projection14Days", "projection30Days", "daysUntilEmpty", "seasonalFactor", "trendFactor", "adjustedProjection30Days", status, "needsRestock", "restockPriority", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Invoice; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Invoice" (id, "customerId", "branchId", "bookingId", date, total) FROM stdin;
4d1a439b-136f-420c-99f5-ff131fc9a8d4	5c07cefe-2407-4130-94eb-af25573a29e0	cmj0bs16u00001atx0vzfjs5n	b6aed0da-7d42-44c7-a331-47b3bbac292f	2025-12-12 03:00:00	1859688
23e48df3-bb3e-43d5-a4b0-bf6598177d89	eb26148b-f8a6-4ab8-a05b-485a20bff123	cmj0bs16u00001atx0vzfjs5n	609034c3-42db-46fa-a548-417bf6b9a88d	2025-12-12 04:15:00	1658130
ad2c554e-66c8-4161-be3d-3da51d6a09e2	3041e3d8-2e59-4229-9eae-5015d60cd788	cmj0bs16u00001atx0vzfjs5n	6c15e398-5838-48ae-a469-d97d0c358be2	2025-12-12 05:30:00	711652
91dcff88-c899-4161-bc7f-e2e406dd4999	f0b63227-3a7c-42d7-b77f-be726eb604c2	cmj0bs16u00001atx0vzfjs5n	3a2cf873-c4a7-4c04-a3b8-3201c3a0f662	2025-12-11 06:45:00	1950225
d738ea1b-bea5-45c2-8653-dd85b47c820f	9221c1be-5a0b-4f9d-9980-38e021b623cc	cmj0bs16u00001atx0vzfjs5n	02ac5738-f4d0-4876-8568-10f31127be39	2025-12-11 07:00:00	1639631
c7de8bbe-0ba4-405e-800f-efd76c764e39	1375a00d-a496-44c8-90db-6e72eb37be9f	cmj0bs16u00001atx0vzfjs5n	1386e066-a0a9-4f05-8943-4aad8c354ad4	2025-12-11 08:15:00	918115
dc16eaec-0062-4005-a15e-1d73534d9f3d	176e1689-1fed-40ec-9517-a59e0629afc3	cmj0bs16u00001atx0vzfjs5n	28e1f552-17f9-42f1-8b8b-9ed7f0ff097e	2025-12-10 03:30:00	1041224
9df285c6-cf43-4453-9cdf-7429daa5c249	d103fa6d-00b8-4555-a5fc-9e3f5b61a235	cmj0bs16u00001atx0vzfjs5n	fb31b218-4f94-40e3-8746-88355fd17f3c	2025-12-10 04:45:00	1404883
f6ae33f3-9568-4204-952f-86d1cdefd97a	9e91eca8-b316-4a5e-84f1-9d724cb21ce5	cmj0bs16u00001atx0vzfjs5n	7a20ee8d-a936-47a6-8d39-ae9fb74766da	2025-12-10 05:00:00	1294618
dfec513b-ec8a-4c3e-9592-56fbdbf96466	62f6c615-535a-4ac9-8441-f227a36edcdf	cmj0bs16u00001atx0vzfjs5n	eb23888d-ef07-4484-aa30-caa1120dacd9	2025-12-09 06:15:00	2174971
\.


--
-- Data for Name: InvoiceItem; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."InvoiceItem" (id, "invoiceId", "serviceId", "productId", amount) FROM stdin;
\.


--
-- Data for Name: KPISummary; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."KPISummary" (id, "staffId", month, revenue, "serviceCount", "productSales", score) FROM stdin;
\.


--
-- Data for Name: License; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."License" (id, "partnerId", plan, price, period, "startDate", "endDate", "autoRenew", status, "paymentStatus", "lastPaymentDate", "nextPaymentDate", "paymentHistory", "reminderSent", "reminderSentAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Location; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Location" (id, "branchId", code, zone, rack, shelf, bin, description, "isActive", capacity, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: LossAlert; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."LossAlert" (id, type, severity, "productId", "staffId", "serviceId", "mixLogId", "expectedQty", "actualQty", "lossQty", "lossRate", "fraudPattern", "fraudScore", behavior, "thresholdType", "thresholdValue", deviation, description, recommendation, status, "detectedAt", "reviewedAt", "reviewedBy", "resolvedAt") FROM stdin;
\.


--
-- Data for Name: LoyaltyPoint; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."LoyaltyPoint" (id, "customerId", "invoiceId", points, description, "createdAt") FROM stdin;
\.


--
-- Data for Name: LoyaltyPrediction; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."LoyaltyPrediction" (id, "customerId", "predictionType", score, "predictedValue", confidence, "predictedDate", factors, "aiAnalysis", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: LoyaltyTier; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."LoyaltyTier" (id, name, "minSpend", discount, perks) FROM stdin;
\.


--
-- Data for Name: MarketingAutomation; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."MarketingAutomation" (id, "campaignId", name, "triggerType", segment, steps, "isActive", "startDate", "endDate", triggered, completed, conversion, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MarketingCampaign; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."MarketingCampaign" (id, type, name, description, segment, channel, status, "scheduledAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: MarketingChannel; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."MarketingChannel" (id, name, type, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MarketingContent; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."MarketingContent" (id, "campaignId", "contentType", title, content, "imagePrompt", hashtags, platform, "scheduledDate", "publishedDate", "isPublished", views, likes, comments, shares, clicks, "isAIGenerated", "aiModel", "generationPrompt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MarketingDataPoint; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."MarketingDataPoint" (id, "channelId", date, leads, bookings, arrivals, conversions, "adSpend", "totalCost", revenue, "costPerLead", "costPerCustomer", "conversionRate", "returnRate", metadata) FROM stdin;
\.


--
-- Data for Name: MarketingLog; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."MarketingLog" (id, "campaignId", "customerId", channel, status, "createdAt") FROM stdin;
\.


--
-- Data for Name: MarketingSegment; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."MarketingSegment" (id, name, description, criteria, "customerCount", "averageLTV", "averageSpend", "isAIGenerated", "aiAnalysis", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MarketingTrend; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."MarketingTrend" (id, "trendType", title, description, popularity, season, source, "aiAnalysis", recommendations, "detectedAt", "expiresAt") FROM stdin;
\.


--
-- Data for Name: MembershipMetric; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."MembershipMetric" (id, "periodStart", "periodEnd", "periodType", tier, "memberCount", "totalSpending", "avgSpending", "avgLTV", "totalVisits", "avgVisits", "retentionRate", upgrades, downgrades, "createdAt") FROM stdin;
\.


--
-- Data for Name: MembershipTier; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."MembershipTier" (id, "tierLevel", "tierName", "tierOrder", "minSpending", "periodMonths", "minVisits", "minLTV", "pointMultiplier", benefits, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MinaMemory; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."MinaMemory" (id, "customerId", "memoryType", category, key, value, details, source, "sourceId", confidence, "confirmedCount", "lastUsed", "usageCount", "createdAt", "updatedAt", "expiresAt") FROM stdin;
\.


--
-- Data for Name: MixLog; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."MixLog" (id, "serviceId", "visitId", "staffId", "productId", quantity, "expectedQty", "actualQty", cost, note, "imageUrl", "createdAt", "branchId") FROM stdin;
\.


--
-- Data for Name: MonthlyReport; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."MonthlyReport" (id, "reportMonth", "reportYear", "totalRevenue", "totalCost", profit, margin, "revenueGrowth", "costChange", "totalCustomers", "returningCustomers", "newCustomers", "returnRate", "servicesByCategory", "serviceRevenue", "serviceCost", "serviceProfit", "serviceTrends", "totalProductUsage", "usageByCategory", "averageUsagePerService", "productCostByCategory", "stockIn", "stockOut", "endingStock", "excessStock", "lowStockItems", "averageLossRate", "lossChange", "highLossProducts", "suspiciousStaff", "inventoryMismatch", "staffRevenue", "staffEfficiency", "staffWarnings", "topPerformers", "costOptimization", "inventoryOptimization", "marketingSuggestions", "trainingNeeds", "aiSummary", "generatedAt", "generatedBy") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Notification" (id, "userId", title, message, status, data, "createdAt") FROM stdin;
\.


--
-- Data for Name: OperationLog; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."OperationLog" (id, "userId", role, "sopStep", action, "customerId", "timestamp", meta) FROM stdin;
\.


--
-- Data for Name: Partner; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Partner" (id, "salonName", "ownerName", phone, email, plan, "licenseStatus", "licenseStartDate", "licenseEndDate", timezone, currency, language, metadata, notes, "isActive", "suspendedAt", "suspendedReason", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PartnerPerformance; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."PartnerPerformance" (id, "partnerId", "periodStart", "periodEnd", "periodType", revenue, profit, margin, "totalCustomers", "newCustomers", "returningCustomers", "returnRate", "totalServices", "avgServiceTime", "conversionRate", "upsaleRate", "productCost", "staffCost", "otherCosts", "avgQualityScore", "errorRate", "customerRating", "lossRate", "wasteAmount", "aiAnalysis", strengths, weaknesses, recommendations, "createdAt") FROM stdin;
\.


--
-- Data for Name: PartnerQualityScore; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."PartnerQualityScore" (id, "partnerId", "periodStart", "periodEnd", "overallScore", "technicalScore", "serviceScore", "consistencyScore", "sopCompliance", "sopViolations", "errorCount", "errorTypes", "criticalErrors", "aiAnalysis", recommendations, "createdAt") FROM stdin;
\.


--
-- Data for Name: PeakHourDetection; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."PeakHourDetection" (id, date, "timeSlot", "dayOfWeek", "bookingCount", "waitingCustomers", "availableSeats", "availableStylists", "totalStylists", "onlineInquiries", "pageViews", "trafficLevel", "peakScore", "branchId", "serviceIds", "createdAt") FROM stdin;
\.


--
-- Data for Name: PersonalizationMetric; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."PersonalizationMetric" (id, "customerId", "personalizationScore", "recommendationAccuracy", "customerSatisfaction", "recommendationsReceived", "recommendationsAccepted", "recommendationsRejected", "minaInteractions", "followUpResponses", "bookingFrequency", "preferencesUpdated", "lastPreferenceUpdate", "periodStart", "periodEnd", "periodType", "createdAt") FROM stdin;
\.


--
-- Data for Name: PersonalizedFollowUp; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."PersonalizedFollowUp" (id, "customerId", "bookingId", "serviceId", "followUpType", priority, tone, length, content, "scheduledAt", "sentAt", "readAt", "responseReceived", "responseContent", status, "aiGenerated", "personalizationFactors", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PersonalizedRecommendation; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."PersonalizedRecommendation" (id, "customerId", "stylistId", "recommendationType", priority, "recommendedStyle", "recommendedColor", "recommendedService", "recommendedProducts", reasoning, "personalizationFactors", confidence, "customerMatchScore", "stylistMatchScore", "aiGenerated", "fullExplanation", status, "presentedAt", "acceptedAt", "rejectedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PointsTransaction; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."PointsTransaction" (id, "customerId", "membershipId", "transactionType", points, source, "sourceId", "baseAmount", multiplier, "calculatedPoints", description, "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: PorosityElasticityAnalysis; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."PorosityElasticityAnalysis" (id, "customerId", "scanId", porosity, "porosityLevel", elasticity, "elasticityLevel", "stretchTest", "proteinLevel", "moistureLevel", balance, analysis, "riskFactors", recommendations, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PostServiceAudit; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."PostServiceAudit" (id, "bookingId", "serviceId", "staffId", "auditScore", "colorScore", "curlScore", "shineScore", "evennessScore", "aiAnalysis", strengths, improvements, "beforeImageUrl", "afterImageUrl", status, "reviewedBy", "reviewedAt", "reviewNotes", "auditedAt") FROM stdin;
\.


--
-- Data for Name: PricingHistory; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."PricingHistory" (id, "serviceId", "branchId", "stylistId", "previousPrice", "newPrice", "changeAmount", "changePercent", "changeReason", "appliedRules", "demandLevel", "trafficLevel", "changedBy", "changedAt") FROM stdin;
\.


--
-- Data for Name: PricingOptimization; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."PricingOptimization" (id, "periodStart", "periodEnd", "periodType", "serviceId", "branchId", "currentRevenue", "optimizedRevenue", "revenueIncrease", "revenueIncreasePercent", "currentAvgPrice", "optimizedAvgPrice", "optimizationFactors", recommendations, "expectedImpact", "aiAnalysis", "createdAt") FROM stdin;
\.


--
-- Data for Name: PricingRule; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."PricingRule" (id, "ruleType", "ruleName", priority, conditions, "adjustmentType", "adjustmentValue", "adjustmentDirection", "serviceIds", "branchIds", "stylistIds", "startDate", "endDate", "isActive", description, "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Product" (id, name, category, "subCategory", unit, "defaultUsage", "branchAware", "pricePerUnit", stock, "minStock", "maxStock", "expiryDate", "imageUrl", notes, capacity, "capacityUnit", "supplierId", "costPrice", "isActive", sku) FROM stdin;
5a82e509-d4bc-46ab-bf32-1dced713f545	Dầu dưỡng tóc Goldwell	Care	Treatment	Chai	\N	t	35000	2500	1000	3000	\N	\N	Dầu dưỡng tóc cao cấp	250	ml	\N	\N	t	\N
38634b2c-71cd-4b7a-afc4-1c79b5b8aa5e	Kem ủ tóc L'Oreal	Care	Treatment	Túi	\N	t	30000	1500	500	2000	\N	\N	Kem ủ tóc phục hồi	500	g	\N	\N	t	\N
ed72b327-13fa-4902-a5d9-90a24639b1a7	Serum dưỡng tóc Wella	Care	Treatment	Chai	\N	t	40000	2000	800	2500	\N	\N	Serum dưỡng tóc chuyên sâu	100	ml	\N	\N	t	\N
3823207f-9f25-4e97-af86-75fa0460f889	Gel tạo kiểu	Care	Styling	Ống	\N	t	25000	600	200	1000	\N	\N	Gel tạo kiểu tóc	200	g	\N	\N	t	\N
97fac3e6-a165-4c5d-bc7c-f01d8c18a01a	Thuốc uốn nóng Goldwell	Chemical	Uốn nóng	Ống	\N	t	50000	1500	500	2000	\N	\N	Thuốc uốn nóng cao cấp	100	ml	\N	\N	t	\N
7b2beb94-6012-4ec2-98ad-84930564e2c7	Thuốc uốn nóng L'Oreal	Chemical	Uốn nóng	ml	\N	t	45000	1200	500	2000	\N	\N	Thuốc uốn nóng phổ biến	\N	\N	\N	\N	t	\N
d26f25c7-7aa5-435a-9f0b-9b36da83a407	Thuốc uốn lạnh Wella	Chemical	Uốn lạnh	Chai	\N	t	60000	800	300	1500	\N	\N	Thuốc uốn lạnh chuyên nghiệp	500	ml	\N	\N	t	\N
086d1d26-d9ac-4a13-a027-abe4b5ee420b	Thuốc uốn lạnh Schwarzkopf	Chemical	Uốn lạnh	Chai	\N	t	55000	600	300	1500	\N	\N	Thuốc uốn lạnh chất lượng cao	500	ml	\N	\N	t	\N
374a5e37-ef5a-4983-a690-0eb40ce26bed	Thuốc nhuộm màu đen	Nhuộm	Màu cơ bản	Ống	\N	t	40000	2000	1000	3000	\N	\N	Thuốc nhuộm màu đen phổ biến	60	ml	\N	\N	t	\N
3111bcec-d911-4cfd-a6f7-4b5fcb8f9bf0	Thuốc nhuộm màu nâu	Nhuộm	Màu cơ bản	Ống	\N	t	40000	1800	800	2500	\N	\N	Thuốc nhuộm màu nâu	60	ml	\N	\N	t	\N
f4262979-add4-4de6-b11e-ed79da03cd43	Thuốc nhuộm màu vàng	Nhuộm	Màu sáng	Ống	\N	t	45000	1000	500	2000	\N	\N	Thuốc nhuộm màu vàng	60	ml	\N	\N	t	\N
95a46917-ffe2-48ce-81c7-70965ef1af39	Thuốc nhuộm màu đỏ	Nhuộm	Màu đặc biệt	Ống	\N	t	50000	500	300	1500	\N	\N	Thuốc nhuộm màu đỏ	60	ml	\N	\N	t	\N
e28eb638-ab36-432c-ab4d-0f1e0dae4539	Sáp vuốt tóc	Care	Styling	Hộp	\N	t	20000	400	150	800	\N	\N	Sáp vuốt tóc nam	100	g	\N	\N	t	\N
0d660156-03d5-42a5-83f8-846850e96fbd	Keo xịt tóc	Care	Styling	Chai	\N	t	30000	500	300	1200	\N	\N	Keo xịt tóc giữ nếp	300	ml	\N	\N	t	\N
0dc5eeae-9aa6-4392-8caf-b7a1bf5d86a7	Thuốc tẩy tóc	Chemical	Tẩy	Chai	\N	t	70000	150	500	2000	\N	\N	Thuốc tẩy tóc chuyên nghiệp	1000	ml	\N	\N	t	\N
722231cf-5e67-409b-af6c-3a1dcdf0783d	Thuốc nhuộm màu xanh	Nhuộm	Màu đặc biệt	Ống	\N	t	55000	100	200	1000	\N	\N	Thuốc nhuộm màu xanh	60	ml	\N	\N	t	\N
bc2b4975-2dd1-4b3a-99af-891397a65c60	DẦU TRỢ NHUỘM VEROGLAZE 950ML	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469442855	1000	ml	\N	\N	t	\N
44b0e254-8f7f-418d-933c-d4680281bf11	KEM NHUỘM TÓC VKC 8A (MÀU TRO)	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 74469472401	\N	\N	\N	\N	t	\N
a63860ab-69d1-49be-bc65-fc7e96970151	KEM TẨY NÂNG SÁNG 8 CẤP ĐỘ VK CRÈME LIGHTENER	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469486583	300	ml	\N	\N	t	\N
2c772d32-9e21-43eb-8dec-1fec6b7d1600	SANDY CAKE	KỸ THUẬT DORADO	\N	Tuýp	\N	t	190000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684008738	\N	\N	\N	\N	t	\N
73a07ae5-488a-46ca-9064-b6b0943f3617	KEM UÔN DUỖI TÓC STRAIT GLATT SỐ 0	KT Schwarzkopf	\N	Túi	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Schwarzkopf\nSKU: 6924339210586	400	ml	\N	\N	t	\N
6f3d4f78-5680-443c-ad31-3c8a1176f0a2	MÀU GORA L89	KỸ THUẬT DKSH	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 4045787389807	\N	\N	\N	\N	t	\N
5f2221ba-ed73-4a82-b73a-129c8249cab6	MÀU GORA L33	KỸ THUẬT SCHWARZKOPF	\N	Chai	\N	t	50	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 4045787390063	\N	\N	\N	\N	t	\N
5f4b150b-e272-41ee-86a2-2a72330e963c	MÀU GORA L88	KỸ THUẬT DKSH	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 4045787389746	\N	\N	\N	\N	t	\N
89eb3f20-d4ed-4f26-a045-1b5050806d23	SUGAR PEARL	KỸ THUẬT DORADO	\N	Tuýp	\N	t	190000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684008776	\N	\N	\N	\N	t	\N
7169758d-c164-4488-bce3-b60e86fa8132	TONER BLUEBERRY COLA	KỸ THUẬT DORADO	\N	Tuýp	\N	t	180000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684008820	\N	\N	\N	\N	t	\N
067239ed-4190-4f94-bc35-db609d5fe36a	TONER SILVER CANDY	KỸ THUẬT DORADO	\N	Tuýp	\N	t	180000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684008714	100	ml	\N	\N	t	\N
030ff5ac-3c82-4d20-a873-0c6e7617c644	MÀU NHUỘM LUMISHINE 6BA(6.8)	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: J15556	\N	\N	\N	\N	t	\N
19663c50-2cb7-4629-a634-a69b3914cdce	MÀU IGORA L22	KỸ THUẬT SCHWARZKOPF	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP232655	\N	\N	\N	\N	t	\N
685931ee-a1e5-4129-8399-ce0d8093b85e	MÁY KẸP THẲNG VUÔNG	MÁY KẸP	\N	Cái	\N	t	1680000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP448572	\N	\N	\N	\N	t	\N
49ee846d-5c04-4ae0-ac8b-de1063c087e5	TẨY TẾ BÀO DA ĐẦU THƯỜNG VÀ NHẠY CẢM KERASTE 500ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	3800000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474636756995	\N	\N	\N	\N	t	\N
31f8bef3-15a2-4725-b305-493614edc368	DẦU XÃ KERASTASE  MỀM MƯỢT 1000ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	3400000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474630647619	1000	ml	\N	\N	t	\N
890f49c1-8e72-4451-bacb-b12d5e97799a	GW-DẦU GỘI KERASILK CONTROL 1000ML	CHĂM SÓC GOLDWELL	\N	Chai	\N	t	1750000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609652076	1000	ml	\N	\N	t	\N
c99cadfd-b570-4e39-ad5f-4593a7e8e74b	GW-DẦU XÃ KERASILK CONTROL 1000ML	CHĂM SÓC GOLDWELL	\N	Chai	\N	t	1750000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609652083	1000	ml	\N	\N	t	\N
40941abe-2372-41c8-aac2-cc589f23f998	Dầu gội JOICO MOISTURE RECOVERY 300ML / 2643046	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	520000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469513951	\N	\N	\N	\N	t	\N
3316691e-3842-4975-8ac9-7dc990005cd4	LAKME- MẶT NẠ WHITE SILVER GIỮ BÓNG CHO TÓC RẤT SÁNG HOẶC BẠC 1000ML	CHĂM SÓC LAKME	\N	Chai	\N	t	2090000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8429421440219	\N	\N	\N	\N	t	\N
ae723021-282f-458c-90fd-d7c4cc015bf2	TÓC GIẢ BỘ 3 PHÍM  MÀU  TẨY	TÓC GIẢ	\N	Chai	\N	t	7900000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP588036	\N	\N	\N	\N	t	\N
4d3e5ddf-70db-4f4e-9527-5b88ee627fe2	DẦU XẢ KHÔ AVEDA  SMOOTH INFUSION 100ML	CHĂM SÓC AVEDA	\N	Tuýp	\N	t	1035000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084037492	100	ml	\N	\N	t	\N
d29f5809-06f8-4d41-8153-85114d814866	DORADO CREAM 9A	KỸ THUẬT DORADO	\N	Tuýp	\N	t	180000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684009209	\N	\N	\N	\N	t	\N
02a8de69-4a50-4d39-b915-0627a3b21ee9	DORADO CREAM 11B	KỸ THUẬT DORADO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684009315	100	ml	\N	\N	t	\N
84e1a9ef-bceb-45b7-b69c-a6bc0235b317	DORADO CREAM 7B	KỸ THUẬT DORADO	\N	Tuýp	\N	t	190000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684009278	100	ml	\N	\N	t	\N
93375fbc-343c-47d2-a1d4-238764387cd9	DƯỠNG CHẤT FIBRELEX SỐ 1 SCHWARZKOPF	KỸ THUẬT SCHWARZKOPF	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 4045787336627	\N	\N	\N	\N	t	\N
88250a33-a6b9-497a-88d9-912a1471ad31	DORADO CREAM 9CV	KỸ THUẬT DORADO	\N	Tuýp	\N	t	180000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684009902	\N	\N	\N	\N	t	\N
f12d28f5-1932-45e6-ac8b-a09624658377	DORADO CREAM 10V	KỸ THUẬT DORADO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684009919	100	ml	\N	\N	t	\N
70cf08d1-8556-4922-acc7-af1b890afb0e	DORADO CREAM 10B	KỸ THUẬT DORADO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684009308	100	ml	\N	\N	t	\N
ad5decfb-46b4-4911-87f1-cd21e285652c	DORADO CREAM 8V	KỸ THUẬT DORADO	\N	Chai	\N	t	190000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684009896	\N	\N	\N	\N	t	\N
d3cfcd7e-4954-42ff-8e9e-e0d52772577d	MÀU NHUỘM LUMISHINE 7BA (7.8) 74ML	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: J15555	74	ml	\N	\N	t	\N
585c3267-358a-46c8-ba30-6f23cd8a118e	DORADO CREAM 7CV	KỸ THUẬT DORADO	\N	Tuýp	\N	t	190000	0	\N	\N	\N	\N	Thương hiệu: SCREEN\nSKU: 8055684009889	\N	\N	\N	\N	t	\N
4b4e99dc-753c-459a-a548-747006de6aab	SCREEN OXI 12% (40 VOL)	OXI SCREEN	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: SCREEN\nSKU: OXI40	\N	\N	\N	\N	t	\N
272fa04d-1688-47e3-a673-609313faecb6	PHỦ BÓNG LM000	PHỦ BÓNG HQ	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	SKU: LM000	\N	\N	\N	\N	t	\N
94f83e9d-85c6-4f5b-a543-68e4d3ca985d	PHỦ BÓNG LM088	PHỦ BÓNG HQ	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	SKU: LM088	\N	\N	\N	\N	t	\N
16245abb-e51f-4ac2-8001-be4984b931a0	PHỦ BÓNG LM038	PHỦ BÓNG HQ	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	SKU: LM038	\N	\N	\N	\N	t	\N
b809b8d3-411f-4f7b-ada2-39555d3a4907	PHỦ BÓNG LM045	PHỦ BÓNG HQ	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	SKU: LM045	\N	\N	\N	\N	t	\N
1d948950-a77c-4e49-989b-63ca52bbdd09	PHỦ BÓNG LM064	PHỦ BÓNG HQ	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	SKU: LM064	\N	\N	\N	\N	t	\N
d442d46d-bf1e-47cc-bcf5-115a39d37265	PHỦ BÓNG LM033	PHỦ BÓNG HQ	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	SKU: LM066	\N	\N	\N	\N	t	\N
4b58418f-e813-44ce-92ee-efeb5c85df4b	PHỦ BÓNG LM066	PHỦ BÓNG HQ	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	SKU: LM033	\N	\N	\N	\N	t	\N
0bb8bc70-20ec-4617-b29f-3f15c5f21a5e	PHỦ BÓNG LM065	PHỦ BÓNG HQ	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	SKU: LM065	\N	\N	\N	\N	t	\N
48e47ed1-47b8-450b-a199-fc3baf5cce43	PHỦ BÓNG LM011	PHỦ BÓNG HQ	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	SKU: LM011	\N	\N	\N	\N	t	\N
5825008c-7b94-4450-b5b6-f06cb11bf733	DORADO CREAM 6B	KỸ THUẬT DORADO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684009261	100	ml	\N	\N	t	\N
d0177e52-7492-4ddb-9bf3-93d999b0f339	TC MAX 6VV-250ml-N	KỸ THUẬT GOLDWEL	\N	Chai	\N	t	1060000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609003786	\N	\N	\N	\N	t	\N
32ca30ba-629f-4375-90a7-39ca96b64d16	MÀU NHUỘM TOPCHIC 5MB-250ml	KỸ THUẬT GOLDWEL	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609002871	250	ml	\N	\N	t	\N
51e8983d-41af-4cf9-bc1f-24b5d464701e	MÀU NHUỘM TOPCHIC 5VV -250ml	KỸ THUẬT GOLDWEL	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609003717	250	ml	\N	\N	t	\N
01ad8da3-98b2-4646-8c1d-37dcad26e517	MÀU NHUỘM TOPCHIC 7A -250ml - N	KỸ THUẬT GOLDWEL	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609003212	250	ml	\N	\N	t	\N
c7eaa49a-ca68-4a0f-98ae-b9c8130df431	TC 7KG -250ml - N	KỸ THUẬT GOLDWEL	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609003380	\N	\N	\N	\N	t	\N
e1396dbc-c21a-44c0-978f-c816cc239505	TC 8KG -250ML-N	KỸ THUẬT GOLDWEL	\N	Chai	\N	t	490000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609003595	\N	\N	\N	\N	t	\N
53b54c53-dc2e-4652-bc29-48390fbbb2b8	BỘ KỀM  BẠC CHÍ TÂM	KỀM NGHĨA	\N	Cái	\N	t	660000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP398558	\N	\N	\N	\N	t	\N
21d330f0-d977-424a-ad65-bc0f14ae1716	BỘ KỀM NỮ CHÍ TÂM	KỀM NGHĨA	\N	Cái	\N	t	850000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP398559	\N	\N	\N	\N	t	\N
94c80b1e-5f16-4b97-836b-d4f7d1a6d8ba	BỘ KỀM VÀNG  CHÍ TÂM	KỀM NGHĨA	\N	Cái	\N	t	1350000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP398560	\N	\N	\N	\N	t	\N
0bc702d7-ac40-49dd-86f9-8f0932f5aa78	CÂY LẤY KHÓE NAIL	KỀM NGHĨA	\N	Cái	\N	t	30000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP398630	\N	\N	\N	\N	t	\N
344af549-3405-4f81-a538-ca72c9a8b5f0	Tóc mái bay (mái phủ)	PHÍM TÓC, TÓC MÁI	\N	Cái	\N	t	950000	0	\N	\N	\N	\N	SKU: mái phủ	\N	\N	\N	\N	t	\N
08c535f3-951d-4fb8-a70e-aa6ed922fc1d	Tóc mái thưa	PHÍM TÓC, TÓC MÁI	\N	Cái	\N	t	650000	0	\N	\N	\N	\N	SKU: mái thưa	\N	\N	\N	\N	t	\N
4c2495c1-2eb4-44b1-b22b-ca9a1569858f	Tóc mái thưa ngang	PHÍM TÓC, TÓC MÁI	\N	Cái	\N	t	650000	0	\N	\N	\N	\N	SKU: mái thưa ngang	\N	\N	\N	\N	t	\N
5317f91f-bfad-4b00-8793-d44b9c67d342	MÁY KẸP TRÒN	MÁY KẸP	\N	Cái	\N	t	1680000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP427191	\N	\N	\N	\N	t	\N
6cb6ea78-9f75-4228-8904-6e70ac5d6898	MÁY BẤM GÃY	MÁY KẸP	\N	Cái	\N	t	680000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP441634	\N	\N	\N	\N	t	\N
edc2a710-c9af-431a-ba89-1d94f761015a	DORADO CREAM 8B	KỸ THUẬT DORADO	\N	Chai	\N	t	190000	0	\N	\N	\N	\N	SKU: 8055684009285	\N	\N	\N	\N	t	\N
33059edd-27d2-4005-a016-4c1a6b5f56f4	DORADO CREAM 9B	KỸ THUẬT DORADO	\N	Tuýp	\N	t	190000	0	\N	\N	\N	\N	SKU: 8055684009292	\N	\N	\N	\N	t	\N
d267255e-c2bf-4f08-9053-6deb8494688a	LƯỢC TRÒN SẤY	PHỤ KIỆN	\N	Cái	\N	t	300000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP448697	\N	\N	\N	\N	t	\N
7b960a90-13b0-47cf-98db-39bf55d18c13	THỰC PHẨM CHỨC NĂNG	KHÁC	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: TPCN	\N	\N	\N	\N	t	\N
ed34b866-acb6-46d8-9ea8-f3d812abc64e	DẦU GỘI KERASTASE  DÀNH CHO TÓC KHÔ 1000ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	3200000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474630564893	1000	ml	\N	\N	t	\N
df182e19-461c-433f-a67a-19198343fc15	DẦU XÃ KERASTASE  DÀNH CHO TÓC KHÔ 1000ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	3400000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474630565173	1000	ml	\N	\N	t	\N
186e4109-9ba8-445d-a58e-0904962aa565	HẤP DẦU KERASTASE DÀNH TÓC KHÔ VÀ DÀY 500ml	CHĂM SÓC KERASTASE	\N	Hũ	\N	t	3100000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474630565630	500	ml	\N	\N	t	\N
846a42bf-b7de-45b5-a3d7-1b7e6680e858	TINH DẦU DƯỠNG ELIXIR KERASTASE (vàng) 100ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1700000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474637215118	\N	\N	\N	\N	t	\N
0261794f-7468-4d9d-a072-d5f6afd55c8f	DUNG DỊCH UỐN PRONEL N2 500ML	KỸ THUẬT DKSH	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP509104	\N	\N	\N	\N	t	\N
978e2706-2a0a-459b-ad90-d73195e07c17	DẦU XẢ KERASTASE TÓC KHÔ 200ML	CHĂM SÓC KERASTASE	\N	Tuýp	\N	t	1250000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474637154981	200	ml	\N	\N	t	\N
085d676c-6052-4f9a-a945-6cff8ec3bcbf	DẦU GỘI KERASTASE DÀNH CHO TÓC KHÔ 250ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1150000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474637154912	250	ml	\N	\N	t	\N
cbee3848-f3ec-4c46-ad04-c35769eca60a	MAGICOLOR OXIG TÍM	OXY	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: KC050	\N	\N	\N	\N	t	\N
59bfe4f8-25f3-4996-80d5-78847be3ee57	MÀU OX3	OXY	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP006	\N	\N	\N	\N	t	\N
f800c340-c9b9-43cd-abaf-2fbc34844da8	TONER HONEY CRUNCH	KỸ THUẬT DORADO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684008769	\N	\N	\N	\N	t	\N
41ee5109-7246-4aed-bbda-4edbc97e0682	TONER LAVENDER ICE	KỸ THUẬT DORADO	\N	Tuýp	\N	t	190000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684008721	\N	\N	\N	\N	t	\N
f2b2c994-eea3-434e-82dc-69ddf944ceac	DORADO CREAM 9N	KỸ THUẬT DORADO	\N	Tuýp	\N	t	190000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684009087	\N	\N	\N	\N	t	\N
1f23677b-ce41-49ff-8952-81758f93020b	DẦU GỘI KERASTASE  MỀM MƯỢT   250ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1150000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636400195	250	ml	\N	\N	t	\N
9334f49d-c08c-44e3-a1dc-078d318682da	DẦU GỘI KERASTASE  MỀM MƯỢT 1000ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	3200000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 347630647534	1000	ml	\N	\N	t	\N
854206e0-773b-4ad2-88b9-adc21d9e6dd8	DẦU GỘI KERASTASE GENESIS GIẢM RỤNG 250ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1150000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636857814	250	ml	\N	\N	t	\N
07468e38-089d-4672-88a4-b89784b638a2	DẦU XÃ  KERASTASE GENESIS CHỐNG RỤNG TÓC 200ML	CHĂM SÓC KERASTASE	\N	Tuýp	\N	t	1250000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636857883	200	ml	\N	\N	t	\N
30a90648-3594-4ee0-b88c-6c67261fc05c	DẦU XÃ KERASTASE GENESIS GIẢM RỤNG TÓC 1000ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	3400000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636857906	1000	ml	\N	\N	t	\N
d0ddce8d-d9ce-4f01-b840-dbc9511efcbd	MẶT NẠ KERASTASE GENESIS  500ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	3100000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474636857944	500	ml	\N	\N	t	\N
f0443a30-732c-4f11-939f-01e239b9554f	DẦU XÃ  KERASTASE  MỀM MƯỢT 200ML	CHĂM SÓC KERASTASE	\N	Tuýp	\N	t	1250000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636400201	200	ml	\N	\N	t	\N
e71cc83a-4b3f-482b-a011-492c895c3924	NÂNG TÔNG LATWELL	OXY	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP517836	\N	\N	\N	\N	t	\N
a9d087e8-1934-4ee7-9fd4-5f604faeb454	MOUNIR KERATIN TREATMENT 1000ML	OXY	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP00010	\N	\N	\N	\N	t	\N
879a69fc-7b92-4d18-9fbf-9d0687a67ac0	TONER GOLD COOKIE	KỸ THUẬT DORADO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684008745	\N	\N	\N	\N	t	\N
54db5375-6e6a-4cf2-9517-7ffeeef611f1	DẦU GỘI KERASTASE GENESIS chống rụng TÓC KHÔ  1000Ml	CHĂM SÓC KERASTASE	\N	Chai	\N	t	3200000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636858057	1000	ml	\N	\N	t	\N
7ae83bfb-0873-4183-96e5-b6a7c650e8d1	DẦU GỘI KERASTASE DÀNH CHO TÓC NHUỘM 1000ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	3200000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636494774	1000	ml	\N	\N	t	\N
e42fdad3-9da5-4049-8dfc-2ba992021f4e	MẶT NẠ KERASTASE  SUÔN MƯỢT 500ML	CHĂM SÓC KERASTASE	\N	Hũ	\N	t	3100000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474630655034	500	ml	\N	\N	t	\N
edcb392b-d1a1-4053-afe8-24adff4fb136	SÁP BLUE POMADE STRONG HOLD  REUZEL -113G	CHĂM SÓC TÓC DAVINES	\N	Hũ	\N	t	581000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 852578006010	\N	\N	\N	\N	t	\N
de8f4bd7-45c1-4b03-bd03-044fc9e6e8fc	DẦU GỘI KERASTASE GIẢM RỤNG TÓC 250ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1150000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636858033	250	ml	\N	\N	t	\N
83d09320-90a6-43cd-82bf-2ed1e374d43d	SÁP BLUE POMADE STRONG HOLD  REUZEL -340G	CHĂM SÓC TÓC DAVINES	\N	Hũ	\N	t	1094000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 852578006003	340	ml	\N	\N	t	\N
346820d1-a113-4680-9d4e-b0bdc84fa922	SÁP EXTREME HOLD POMADE REUZEL  113g	CHĂM SÓC TÓC DAVINES	\N	Hũ	\N	t	581000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 852968008310	\N	\N	\N	\N	t	\N
81a18d0f-2e43-4a7d-a422-9b83b0c36cf2	MẶT NẠ  KERASTSE  CHROMA ABSOLU GIỮ MÀU 500ML	CHĂM SÓC KERASTASE	\N	Hũ	\N	t	3100000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474637059125	500	ml	\N	\N	t	\N
65502f76-b67d-4824-9cdf-ad90aa5cdc52	HẤP DẦU KERASTSE SUÔN MƯỢT DÀNH CHO TÓC THẲNG  200ML	CHĂM SÓC KERASTASE	\N	Hũ	\N	t	1365000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636400218	200	ml	\N	\N	t	\N
466a8c70-8e75-4d32-8d4d-33b85eb8d8f8	XỊT DƯỠNG KERASTSE  GENESIS THERMIQUE  BẢO VỆ & GIẢM GÃY RỤNG TÓC  150ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1250000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636857975	150	ml	\N	\N	t	\N
e5f945fe-dc9f-451e-a236-e46faf1bebe4	DẦU GỘI KERASTASE CHROMA ABSOLU  GIỮ MÀU 1000ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	3200000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474637059224	1000	ml	\N	\N	t	\N
e0ddc492-dced-486a-989b-896a02e3a07e	DẦU GỘI KERASTSE BẢO VỆ MÀU & PHỤC HỒI TÓC NHUỘM , KHÔ 1000ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	3200000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474637059217	1000	ml	\N	\N	t	\N
d9a2cbc3-1c42-4e06-b56b-71e2412b6d93	DẦU GỘI KERASTASE BẢO VỆ MÀU VÀ PHỤC HỒI TÓC NHUỘM, KHÔ 250ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1150000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474637059002	250	ml	\N	\N	t	\N
9869a859-7a69-410f-ae12-ed75cc32f517	DẦU XẢ KERASTSE  CHROMA ABSOLU GIỮ MÀU 1000ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	3400000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474637059156	1000	ml	\N	\N	t	\N
01608ea0-46a3-411e-ac3b-c179cfecff23	GW-DẦU GỘI KERASILK COLOR 1000ML	CHĂM SÓC GOLDWELL	\N	Chai	\N	t	1750000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609652496	1000	ml	\N	\N	t	\N
7e27d7e3-6252-4a5b-8655-e1a89ab5258a	GW-DẦU GỘI KERASILK COLOR 250ml	CHĂM SÓC GOLDWELL	\N	Chai	\N	t	670000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609652946	250	ml	\N	\N	t	\N
bbc53acc-299e-48aa-a8c5-85427ed4b2e0	GW-DẦU GỘI KERASILK CONTROL 250ML	CHĂM SÓC GOLDWELL	\N	Chai	\N	t	670000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609652007	200	ml	\N	\N	t	\N
9a6de5c0-19db-4017-8161-3b3a986cd342	GW-DẦU GỘI KERASILK RECONSTRUCT 1000ML	CHĂM SÓC GOLDWELL	\N	Chai	\N	t	1750000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609652229	1000	ml	\N	\N	t	\N
4501bc9a-7c1d-4e68-8544-c7a87bc1dd18	GW-DẦU GỘI KERASILK RECONSTRUCT 250ML	CHĂM SÓC GOLDWELL	\N	Chai	\N	t	670000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609652151	250	ml	\N	\N	t	\N
81f03782-bb33-492b-88bd-7c756214189a	GW-DẦU HẤP KERASILK COLOR 500ML	CHĂM SÓC GOLDWELL	\N	Chai	\N	t	1520000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609652519	500	ml	\N	\N	t	\N
fce6a4e0-2a3e-44a4-83c4-478cdaaeebe8	GW-DẦU HẤP KERASILK CONTROL 500ML	CHĂM SÓC GOLDWELL	\N	Chai	\N	t	1520000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609652090	500	ml	\N	\N	t	\N
d7c5c554-a67a-483b-8f14-823752adf7b3	GW-DẦU XÃ KERASILK COLOR 1000ML	CHĂM SÓC GOLDWELL	\N	Chai	\N	t	1750000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609652502	1000	ml	\N	\N	t	\N
e9dfe9c6-65b2-43f3-a5a5-024476c1931c	GW-DẦU XÃ KERASILK RECONSTRUCT 1000ML	CHĂM SÓC GOLDWELL	\N	Chai	\N	t	1750000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609652236	1000	ml	\N	\N	t	\N
d1aa3a63-08be-4bc3-954a-dbfda46c5283	GW-DẦU XẢ KERASILK COLOR 200ML	CHĂM SÓC GOLDWELL	\N	Chai	\N	t	670000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609652410	200	ml	\N	\N	t	\N
7aec3bf9-d854-4f3c-85cd-a57f7170afb5	GW-DẦU XẢ KERASILK CONTROL 200ML	CHĂM SÓC GOLDWELL	\N	Chai	\N	t	670000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609652014	200	ml	\N	\N	t	\N
0993bcb7-d0c5-45b7-b9ac-a5ecd9cb77a4	GW-DẦU XẢ RECONSTRUCT KERASILK 200ML	CHĂM SÓC GOLDWELL	\N	Chai	\N	t	670000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609652168	200	ml	\N	\N	t	\N
571f3de8-2225-408e-a506-8ef7a332f986	GW-KEO XỊT SPRAYER 5 GOLDWELL 300ML	CHĂM SÓC GOLDWELL	\N	Chai	\N	t	350000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609275336	300	ml	\N	\N	t	\N
051f5e6a-2b07-4c96-af07-569261030c4b	GW-XỊT DƯỠNG KERASILK RECONSTRUCT 125ML	CHĂM SÓC GOLDWELL	\N	Chai	\N	t	700000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609652199	125	ml	\N	\N	t	\N
9f0e1b20-5048-4309-a09d-ff5402ecf975	DẦU GỘI KERASTASE CHRONOLOGISTE TRẺ HÓA MÁI TÓC1000ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	5200000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636728282	1000	ml	\N	\N	t	\N
090421ed-cdfe-4e2d-b76e-784043797ecd	Naraxis- Soothing Pure Synergy 50ml	CHĂM SÓC NARAXIS	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: NARS\nSKU: 8033064400129	50	ml	\N	\N	t	\N
4cf8c100-c861-4bba-81df-adebe4d70c5a	OLAPLEX GỘI TÍM ( NO.4P)	CHĂM SÓC OLAPLEX	\N	Chai	\N	t	750000	0	\N	\N	\N	\N	Thương hiệu: Olaplex\nSKU: 850018802192	\N	\N	\N	\N	t	\N
9e8048b7-a42e-450d-9dc9-f9e72d4021c2	OLL-DẦU GỘI OLAPLEX NO.4 250ML	CHĂM SÓC OLAPLEX	\N	Chai	\N	t	750000	0	\N	\N	\N	\N	Thương hiệu: Olaplex\nSKU: 896364002428	\N	\N	\N	\N	t	\N
b3eb541d-5703-483a-b8f4-5e1ce49d57d2	OLL-DẦU XẢ OLAPLEX (NO.5 BOND)250ML	CHĂM SÓC OLAPLEX	\N	Chai	\N	t	750000	0	\N	\N	\N	\N	Thương hiệu: Olaplex\nSKU: 896364002435	\N	\N	\N	\N	t	\N
4eb3fb2f-c4ac-4b55-b1b8-8e777564d2de	OLL-OLAPLEX  NO.4 2000ml	CHĂM SÓC OLAPLEX	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Olaplex\nSKU: 896364002558	\N	\N	\N	\N	t	\N
fd0c22ae-ea28-4657-a435-dfec3f1630dc	OLL-OLAPLEX  NO.5 2000ml	CHĂM SÓC OLAPLEX	\N	Chai	\N	t	3269000	0	\N	\N	\N	\N	Thương hiệu: Olaplex\nSKU: 896364002565	2000	ml	\N	\N	t	\N
0217f87b-794f-458b-8e15-de4c8562faab	OLL-OLAPLEX NO.3 100ML	CHĂM SÓC OLAPLEX	\N	Chai	\N	t	750000	0	\N	\N	\N	\N	Thương hiệu: Olaplex\nSKU: 896364002350	100	ml	\N	\N	t	\N
ce4abc7b-fd54-441d-b20f-e1758a96a142	OLL-OLAPLEX NO.6 100ML	CHĂM SÓC OLAPLEX	\N	Chai	\N	t	750000	0	\N	\N	\N	\N	Thương hiệu: Olaplex\nSKU: 896364002954	\N	\N	\N	\N	t	\N
38bc2498-31d0-44b4-8062-a357aea4aab3	OLL-OLAPLEX NO.7 30ML	CHĂM SÓC OLAPLEX	\N	Chai	\N	t	750000	0	\N	\N	\N	\N	Thương hiệu: Olaplex\nSKU: 896364002671	\N	\N	\N	\N	t	\N
dc1b7c6e-908c-4751-ba87-dfbb7047208d	CHI-XỊT TẠO KIỂU CHI HELMET HEAD 284G	CHĂM SÓC CHI	\N	Chai	\N	t	732000	0	\N	\N	\N	\N	Thương hiệu: CHI\nSKU: 633911641064	\N	\N	\N	\N	t	\N
f2059baa-d7dd-4459-b2ea-d7ae6b21c8cb	MURIEM SCALP CLEASING 250g	CHĂM SÓC TIGI	\N	Chai	\N	t	660000	0	\N	\N	\N	\N	Thương hiệu: TIGI\nSKU: 4985514023317	250	ml	\N	\N	t	\N
6ceb32d2-abad-445e-9d3b-54b6b62d743f	TIGI-TIGI BED HEAD SMALL TALK 240G	CHĂM SÓC TIGI	\N	Chai	\N	t	548000	0	\N	\N	\N	\N	Thương hiệu: TIGI\nSKU: 615908431339	\N	\N	\N	\N	t	\N
3c08bc9f-e766-4fb7-9d37-f79a1cca9acf	DẦU GỘI  DAVINES SOLU  250ML	CHĂM SÓC TÓC DAVINES	\N	Chai	\N	t	396000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 8004608242253	\N	\N	\N	\N	t	\N
7202b9b5-79a4-4af3-b88d-c1a96be4163e	DVD- DẦU GỘI DAVINES RENEWING  TRƯỜNG THỌ 250ML	CHĂM SÓC TÓC DAVINES	\N	Chai	\N	t	424000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 8004608255093	\N	\N	\N	\N	t	\N
b0e9b3e3-b03d-47e1-af4c-47e41a787747	DVN-DẦU GỘI DAVINES DÀNH CHO TÓC GÀU PURIFYING 1000ML	CHĂM SÓC TÓC DAVINES	\N	Chai	\N	t	1083000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 8004608236603	\N	\N	\N	\N	t	\N
c0cc19c2-9496-4771-b8d7-5e653d9fb590	DVN-DẦU GỘI DAVINES ENERGIZING DÀNH CHO TÓC RỤNG 1000ML	CHĂM SÓC TÓC DAVINES	\N	Chai	\N	t	1083000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 8004608255512	\N	\N	\N	\N	t	\N
282a1c71-9562-4d4f-a93e-cef11e927ca4	DVN-DẦU GỘI DAVINES ENERGIZING DÀNH CHO TÓC RỤNG 250ML	CHĂM SÓC TÓC DAVINES	\N	Chai	\N	t	424000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 8004608255505	\N	\N	\N	\N	t	\N
b70a4ef6-94e5-48ab-be8d-0e6123c31f61	DVN-DẦU GỘI DAVINES PURIFYING DÀNH CHO TÓC GÀU 250ML	CHĂM SÓC TÓC DAVINES	\N	Chai	\N	t	424000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 8004608236580	\N	\N	\N	\N	t	\N
117aa32d-48ba-4a6e-ae60-555582b02af4	DVN-DẦU GỘI DAVINES REBALANCING 250ML	CHĂM SÓC TÓC DAVINES	\N	Chai	\N	t	424000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 8004608279327	\N	\N	\N	\N	t	\N
77de74b5-2bd1-42ee-a3cb-85deb5739e1a	DVN-DẦU XẢ RENEWING DAVINES 250ML	CHĂM SÓC TÓC DAVINES	\N	Chai	\N	t	534000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 8004608255116	\N	\N	\N	\N	t	\N
a1fab010-ef8d-4181-9d7a-b6d0dab743e6	DVN- DẦU XÃ TRƯỜNG THỌ RENEWING DAVINES 1000ML	CHĂM SÓC TÓC DAVINES	\N	Chai	\N	t	1780000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 8004608255123	\N	\N	\N	\N	t	\N
166c4a4f-e209-4a73-84e3-dd389d494b47	DẦU XẢ TĂNG PHỒNG JOICO JOIFULL 1000ML / 2497292	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1250000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469512381	1000	ml	\N	\N	t	\N
cef6dbcd-2658-4ea9-9d0a-d8d7d01cc368	BẢNG MÀU JOICO	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP799210	\N	\N	\N	\N	t	\N
b369c679-e40b-498b-982d-1a63a99c8403	JC- GỘI TĂNG PHỒNG JOIFULL 300ML / 2729146	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	520000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469512329	\N	\N	\N	\N	t	\N
8f8ec4a2-2aef-4128-be2e-98fe9c63e96e	DẦU XẢ REPAIR MOROCCANOIL 1000ML	CHĂM SÓC TÓC Moroccanoil	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Moroccanoil\nSKU: 7290011521264	1000	ml	\N	\N	t	\N
2cd53889-2d1a-4dff-887f-b107c60e5a32	DẦU XẢ SMOOTH MOROCCANOIL 1000ML	CHĂM SÓC TÓC Moroccanoil	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Moroccanoil\nSKU: 7290014344952	1000	ml	\N	\N	t	\N
b5afe0fc-cbd3-4a29-943b-442c2db46e5f	MR-DẦU GỘI KHÔ DARK TONES MOROCCANOIL 217ml	CHĂM SÓC TÓC Moroccanoil	\N	Chai	\N	t	682000	0	\N	\N	\N	\N	Thương hiệu: Moroccanoil\nSKU: 7290015485951	217	ml	\N	\N	t	\N
822221d5-e9f5-4a72-8c1e-4ef8ff6b1159	MR-DẦU GỘI REPAIR MOROCCANOIL 1000ML	CHĂM SÓC TÓC Moroccanoil	\N	Chai	\N	t	1550000	0	\N	\N	\N	\N	Thương hiệu: Moroccanoil\nSKU: 7290011521257	1000	ml	\N	\N	t	\N
18b62ff9-2d8a-40c4-9060-943a2b0c0433	MR-DẦU GỘI REPAIR MOROCCANOIL 500ML	CHĂM SÓC TÓC Moroccanoil	\N	Chai	\N	t	875000	0	\N	\N	\N	\N	Thương hiệu: Moroccanoil\nSKU: 7290011521639	\N	\N	\N	\N	t	\N
bfe0a664-7522-49e1-9dea-a6cbc18553c4	MR-DẦU GỘI SMOOTH MOROCCANOIL 1000ML	CHĂM SÓC TÓC Moroccanoil	\N	Chai	\N	t	1550000	0	\N	\N	\N	\N	Thương hiệu: Moroccanoil\nSKU: 7290014344938	\N	\N	\N	\N	t	\N
2c326094-367a-442e-9ded-8dd477be4c84	MR-DẦU GỘI SMOOTH MOROCCANOIL 500ML	CHĂM SÓC TÓC Moroccanoil	\N	Chai	\N	t	1058000	0	\N	\N	\N	\N	Thương hiệu: Moroccanoil\nSKU: 7290015629102	500	ml	\N	\N	t	\N
005abb1c-e808-4ece-8d4b-8389c9956d64	MR-DẦU XÃ REPAIR MOROCCANOIL 500ML	CHĂM SÓC TÓC Moroccanoil	\N	Chai	\N	t	901000	0	\N	\N	\N	\N	Thương hiệu: Moroccanoil\nSKU: 7290011521646	500	ml	\N	\N	t	\N
2cea4719-f025-4c25-9d98-e5a4f7691223	MR-DẦU XÃ SMOOTH MOROCCANOIL 500ML	CHĂM SÓC TÓC Moroccanoil	\N	Chai	\N	t	1102000	0	\N	\N	\N	\N	Thương hiệu: Moroccanoil\nSKU: 7290015629119	\N	\N	\N	\N	t	\N
a315c21b-a5a2-4a75-bc33-756c36d1aeee	MR-TINH DẦU MOROCCANOIL 100ML	CHĂM SÓC TÓC Moroccanoil	\N	Chai	\N	t	1102000	0	\N	\N	\N	\N	Thương hiệu: Moroccanoil\nSKU: 7290011521011	100	ml	\N	\N	t	\N
b64f55ec-ef1e-4dec-9788-0add2b1d7c71	MR-TINH DẦU MOROCCANOIL 200ML	CHĂM SÓC TÓC Moroccanoil	\N	Chai	\N	t	1700000	0	\N	\N	\N	\N	Thương hiệu: Moroccanoil\nSKU: 7290011521059	\N	\N	\N	\N	t	\N
3f8682df-b78e-43d4-a591-a43a52d9f6b5	DẦU GỘI KHÔ MOROCCANOIL LIGHT TONE 217ml	CHĂM SÓC TÓC Moroccanoil	\N	Chai	\N	t	682000	0	\N	\N	\N	\N	Thương hiệu: Moroccanoil\nSKU: 7290015485944	217	ml	\N	\N	t	\N
442c3abd-7500-4004-9bfd-a92e478875d8	LAKME-DẦU GỘI  DÀNH CHO TÓC SÁNG HOẶC BẠC  1000ML	CHĂM SÓC LAKME	\N	Chai	\N	t	1180000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8429421440110	\N	\N	\N	\N	t	\N
49bee5cb-2f25-4b4a-ac2b-70a65d78bc11	LAKME-DẦU GỘI DÀNH CHO TÓC NHUỘM TÍM 1000ML	CHĂM SÓC LAKME	\N	Chai	\N	t	1180000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8429421442718	\N	\N	\N	\N	t	\N
dff5c50a-e492-4e98-a5f9-cba208c56271	LAKME-DẦU GỘI DÀNH CHO TÓC NHUỘM TÍM 300ML	CHĂM SÓC LAKME	\N	Chai	\N	t	610000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8429421442725	\N	\N	\N	\N	t	\N
6026ca72-1441-4af2-a652-6e9bb081c6c0	LAKME-DẦU GỘI DÀNH CHO TÓC NHUỘM ĐỎ 300ML	CHĂM SÓC LAKME	\N	Chai	\N	t	610000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8429421442329	\N	\N	\N	\N	t	\N
c30fb1fc-d243-445e-8eaa-1f51b1df6b11	LAKME-DẦU GỘI DÀNH CHO TÓC NHUỘM ĐỒNG 300ML	CHĂM SÓC LAKME	\N	Chai	\N	t	610000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8429421442527	\N	\N	\N	\N	t	\N
9ee2e68f-9fb6-4655-937d-ebe4843f2181	LAKME-DẦU XẢ DÀNH CHO TÓC NHUỘM TÍM 250ML	CHĂM SÓC LAKME	\N	Chai	\N	t	880000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8429421442824	\N	\N	\N	\N	t	\N
f5f56a4c-94c2-469b-a541-9c517f9959c5	LAKME-DẦU XẢ DÀNH CHO TÓC NHUỘM ĐỎ 250ML	CHĂM SÓC LAKME	\N	Chai	\N	t	880000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8429421442428	\N	\N	\N	\N	t	\N
b6c4996b-567e-4304-89dd-5a8f0a779704	LAKME-DẦU XẢ DÀNH CHO TÓC SÁNG 250ML	CHĂM SÓC LAKME	\N	Chai	\N	t	880000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8429421440226	\N	\N	\N	\N	t	\N
db60008e-0b5f-4e9b-bc65-a7d4c9e74dba	LAKME- DẦU GỘI DÀNH CHO TÓC SÁNG 300ML	CHĂM SÓC LAKME	\N	Chai	\N	t	610000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8429421440127	\N	\N	\N	\N	t	\N
e25fd591-0c58-474d-ae27-e7aa1012ecf3	LAKME-DẦU XẪ DÀNH CHO TÓC NHUỘM ĐỒNG 250ML	CHĂM SÓC LAKME	\N	Chai	\N	t	880000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8429421442626	\N	\N	\N	\N	t	\N
dbc0df03-e5ed-4502-9a20-0a826af62b60	WAX  BỘT SCHWARZKOPF 10G	CHĂM SÓC  Schwarzkopf	\N	Chai	\N	t	390000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 4045787363104	\N	\N	\N	\N	t	\N
6524da84-a34e-4c46-910f-e49d3968b6e9	FIBREPLEX - Schwarzkopf no.1	CHĂM SÓC  Schwarzkopf	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 4045787689587	\N	\N	\N	\N	t	\N
66af0671-88ab-47ac-9f45-d6fc59a1d088	Kem Keratherapy Extreme Renewal Smoothing phục hồi tóc 1000ml	CHĂM SÓC KERATIN	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 852979006909	1000	ml	\N	\N	t	\N
ef469e9c-46a2-4725-b15b-6f96eda053eb	DẦU XẢ KERASTSE  CHROMA ABSOLU GIỮ MÀU 200ML	CHĂM SÓC KERASTASE	\N	Tuýp	\N	t	1250000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474637059187	200	ml	\N	\N	t	\N
9a40acd6-b030-4034-ae84-3d69d75797ab	DẦU GỘI KERASTASE GENESIS GIẢM RỤNG 1000ml	CHĂM SÓC KERASTASE	\N	Chai	\N	t	3200000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636857845	1000	ml	\N	\N	t	\N
f3d8d236-9252-4f52-8029-55dd4e103fc7	TẨY TBC  KERASTASE 250ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1650000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474636757046	\N	\N	\N	\N	t	\N
c1d66b1a-a993-4cb5-b3a5-b13e216e2cf5	TINH CHẤT GIẢM RỤNG TÓC AMINEXIL 10*6ML	CHĂM SÓC LOREAL	\N	Lọ	\N	t	1400000	0	\N	\N	\N	\N	Thương hiệu: L'Oréal Paris\nSKU: 3474636974344	6	ml	\N	\N	t	\N
cbba88f8-389f-4a5a-a6b8-9742981694a1	XỊT BẢO VỆ DA ĐẦU MIELLE	KỸ THUẬT  MILLE	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8809093093775	\N	\N	\N	\N	t	\N
60edca9e-c447-487a-889a-fe772a122a7c	SYSTEM COLOR REMOVE, CHÙI MÀU 150ML	CHĂM SÓC GOLDWELL	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609661566	150	ml	\N	\N	t	\N
85610e10-c66a-491c-a99e-363a3a5ce448	DẦU GỘI KERASTSE  CHROMA ABSOLU GIỮ MÀU 250ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1150000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474637059019	250	ml	\N	\N	t	\N
7f3640db-bc68-4c8f-aea5-dad675a668f3	TÓC GIẢ BỘ FULL MÀU  TẨY	TÓC GIẢ	\N	Chai	\N	t	9900000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: TÓC GIẢ	\N	\N	\N	\N	t	\N
6de01d60-de14-4d65-96d6-afbeab995ad4	TÓC GIẢ BỘ FULL MÀU  KHÔNG TẨY	TÓC GIẢ	\N	Chai	\N	t	8900000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: TÓC GIẢ	\N	\N	\N	\N	t	\N
a81e3d16-fad4-400d-923d-35d111bdf1fa	BỘ 9 PHÍM	PHÍM TÓC, TÓC MÁI	\N	Bộ	\N	t	7900000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP606921	\N	\N	\N	\N	t	\N
7c8a9724-7925-4f68-a4d4-ef1e4422e65f	TÓC GIẢ BỘ 3 PHÍM  MÀU  KHÔNG TẨY	TÓC GIẢ	\N	Chai	\N	t	6900000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP588038	\N	\N	\N	\N	t	\N
b6bb9059-fdd2-4dc2-b9f4-a9d6c7aca043	TÓC GIẢ BỘ 4 PHÍM  MÀU  TẨY	TÓC GIẢ	\N	Chai	\N	t	8900000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP588040	\N	\N	\N	\N	t	\N
08ea20f8-0c04-49a4-b37b-36bce1accf40	TÓC GIẢ BỘ 4 PHÍM  MÀU KHÔNG  TẨY	TÓC GIẢ	\N	Chai	\N	t	7900000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP588041	\N	\N	\N	\N	t	\N
5a7dc702-520a-4cc3-8b8c-a2f0b6fec8b1	GW- DẦU GỘI KS VOLUME 250ML	CHĂM SÓC GOLDWELL	\N	Chai	\N	t	670000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609652274	250	ml	\N	\N	t	\N
ac0768a5-a89b-4df1-8d50-3bb37e0f21e0	GW- DẦU GỘI KS VOLUME 1000ML	CHĂM SÓC GOLDWELL	\N	Chai	\N	t	1750000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609652342	1000	ml	\N	\N	t	\N
4fe3714c-7d71-4769-950c-356624338240	KỀM CẮT DA	KỀM NGHĨA	\N	Cái	\N	t	150000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: kiemcatda	\N	\N	\N	\N	t	\N
bfc690ed-a373-45d8-a348-bc0342e7666f	DẦU GỘI KERASSTASE BLOND ABSOLU TÍM 250ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1650000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636692231	250	ml	\N	\N	t	\N
0aeca08d-f298-4791-b407-770f2b9edba6	PHÍM BỘ 3 PHÍM TẨY	TÓC GIẢ	\N	Chai	\N	t	7900000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: PHÍM BỘ 3 PHÍM	\N	\N	\N	\N	t	\N
4ac1ea95-92e3-4ff8-b944-fd790a873533	PHÍM CHE HÓI	PHÍM TÓC, TÓC MÁI	\N	Cái	\N	t	5900000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP606923	\N	\N	\N	\N	t	\N
cad6614a-c94e-426d-925b-58ac6a65c0a1	PHÍM BỘ 9 PHÍM KHÔNG TẨY	PHÍM TÓC, TÓC MÁI	\N	Bộ	\N	t	8900000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP598848	\N	\N	\N	\N	t	\N
720ff6eb-5e04-4b59-b4c0-0d8879d234ac	OLAPLEX NO.0 155ML	CHĂM SÓC OLAPLEX	\N	Chai	\N	t	750000	0	\N	\N	\N	\N	Thương hiệu: Olaplex\nSKU: 850018802208	155	ml	\N	\N	t	\N
4a1745a7-b5aa-42d1-9497-a53c5de94c60	OLAPLEX NO.8 100ML	CHĂM SÓC OLAPLEX	\N	Chai	\N	t	750000	0	\N	\N	\N	\N	Thương hiệu: Olaplex\nSKU: 896364002930	100	ml	\N	\N	t	\N
d00d5c22-4f84-4bb4-b6ea-5e6b790b0a25	MẶT NẠ DƯỠNG ẨM OLAPLEX 4 IN  1 370ML	CHĂM SÓC OLAPLEX	\N	Chai	\N	t	2200000	0	\N	\N	\N	\N	Thương hiệu: Olaplex\nSKU: 850018802017	370	ml	\N	\N	t	\N
707f620a-14ff-4a4b-a669-9b0660171e7d	LAKME-DẦU XẢ DÀNH CHO TÓC NHUỘM TÍM 1000ML	CHĂM SÓC LAKME	\N	Chai	\N	t	2250000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8429421442817	\N	\N	\N	\N	t	\N
bb18ee06-d1a9-4442-bce8-6acf8dddc666	MÀU NHUỘM LUMISHINE L 89	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP603263	\N	\N	\N	\N	t	\N
341e130f-c8a8-49d8-93bf-1f8d61e028bd	TINH DẦU  KERASSTASE TÍM  DÀNH CHO TÓC TÂY 100ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	2200000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474636948888	\N	\N	\N	\N	t	\N
d1cd33b1-7e51-4dc0-80e9-0a6e62c77eb0	DẦU GỘI KERASTASE BLOND ABSOLU TÍM 1000ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	4200000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636692316	1000	ml	\N	\N	t	\N
5a083632-0ce8-4d6a-9e4f-bcfecd5877a2	PHÍM LIGHT	PHÍM TÓC, TÓC MÁI	\N	Cái	\N	t	300000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP604604	\N	\N	\N	\N	t	\N
f1822400-30ad-43b2-a3e2-4cbcba8c064f	DẦU GỘI KERASSTASE BLOND ABSOLU TÍM  DÀNH CHO TÓC TẨY 250ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1850000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636692170	250	ml	\N	\N	t	\N
150d999e-bdc9-42ba-9d8e-66cac3751b90	PHÍM BỘ 9 PHÍM TẨY	PHÍM TÓC, TÓC MÁI	\N	Bộ	\N	t	7900000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP606921	\N	\N	\N	\N	t	\N
f986d855-3f08-4b09-8c76-b4deab153f60	BỘ TÓC ĐỘI SIÊU DA ĐẦU (TÉM)	PHÍM TÓC, TÓC MÁI	\N	Bộ	\N	t	5000000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP609962	\N	\N	\N	\N	t	\N
86a6f905-93a5-4dbe-9a19-f477900c546f	MÁY SẤY	MÁY KẸP	\N	Cái	\N	t	3600000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP610047	\N	\N	\N	\N	t	\N
b7d03631-c0f4-4b86-9cc1-828bd83e9611	MÁY KẸP MAGIC TITANIUM bản to	MÁY KẸP	\N	Cái	\N	t	3600000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: KẸP MAGIC	\N	\N	\N	\N	t	\N
46d868e6-064b-4be2-a4a8-d2345e386531	MÁY KẸP CHAMVIT	MÁY KẸP	\N	Cái	\N	t	1680000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 6948607405894	\N	\N	\N	\N	t	\N
85cf4d33-bebd-4c87-9e5d-624edcfd0989	MÁY KẸP UỐN LỌN	MÁY KẸP	\N	Cái	\N	t	2600000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP610084	\N	\N	\N	\N	t	\N
ed3a4bc5-a64e-4a5d-91c6-2ee8fc2f2350	DẦU GỘI OLAPLEX SỐ 4 1000ML	CHĂM SÓC OLAPLEX	\N	Chai	\N	t	2400000	0	\N	\N	\N	\N	Thương hiệu: Olaplex\nSKU: 850018802444	1000	ml	\N	\N	t	\N
b3f68ba6-4f68-436b-a12d-b347df12183b	DẦU GỘI KERASTASE LÀM SẠCH & DÀY TÓC 1000ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	4200000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474630664906	1000	ml	\N	\N	t	\N
b265cb19-623b-452e-b24b-b4da3d356a0a	DẦU GỘI KERASTSE KÍCH MỌC TÓC 250ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1600000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474636403912	\N	\N	\N	\N	t	\N
c9a7609d-0b99-4088-a45a-510727c74f93	DẦU XẢ KERASTASE KÍCH MỌC TÓC 200ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1600000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474636404391	\N	\N	\N	\N	t	\N
cf746d4b-e0e9-484b-ac3f-5e75c6e1e770	TINH  DẦU KERASTASE CAO CẤP	CHĂM SÓC KERASTASE	\N	Chai	\N	t	2900000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474636728336	\N	\N	\N	\N	t	\N
46b71c9a-e6c1-4f27-b1f2-663a3f5ae6cc	DẦU XẢ KERASTASE TÍM 250ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1750000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474636692361	\N	\N	\N	\N	t	\N
fa0a5477-a0e8-45e8-9f4d-6324da8df245	AMINO AXIT 1000ML	KỸ THUẬT  MILLE	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: AMNINO AXIT	1000	ml	\N	\N	t	\N
9dfe0265-a789-434b-bf6f-57ebda5cc4fe	DẦU GỘI KERASTASE SIÊU BÓNG  1000ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	4200000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636692217	1000	ml	\N	\N	t	\N
1f817323-7834-43b6-8e3d-3601048ef5f5	DẦU XÃ KERASTASE TÍM 1000ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	4400000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474636692385	\N	\N	\N	\N	t	\N
f65206e6-e121-4708-bd05-2bdb3ec9a4e6	DẦU GỘI  TĂNG PHỒNG JOICO JOIFULL 1000ML	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1250000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: J16177/1	1000	ml	\N	\N	t	\N
ea65840f-4e21-4321-8746-e6ded8c2dc80	ỐNG LÔ HÀN QUỐC SIZE NHỎ	PHỤ KIỆN	\N	Cái	\N	t	60000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: ỐNG LÔ	\N	\N	\N	\N	t	\N
477a7231-9105-46e4-904f-7af3c65abe32	ỐNG LÔ HÀN QUỐC SIZE VỪA	PHỤ KIỆN	\N	Cái	\N	t	60000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: ỐNG LÔ	\N	\N	\N	\N	t	\N
1b3a43a0-940c-40a7-bfc3-56e3d1891d71	PHỤ KIỆN	PHỤ KIỆN	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP617494	\N	\N	\N	\N	t	\N
5f8d4d79-b71c-46e2-83f2-d5424c6f4243	MÁY KẸP THẮNG VUÔNG	MÁY KẸP	\N	Cái	\N	t	1680000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP617503	\N	\N	\N	\N	t	\N
49b594e2-c834-4456-b2fb-413dcda7942d	LR-DẦU GỘI SERIOXYL LOREAL 1500ML	CHĂM SÓC LOREAL	\N	Chai	\N	t	2200000	0	\N	\N	\N	\N	Thương hiệu: L'Oréal Paris\nSKU: 3474637106355	1500	ml	\N	\N	t	\N
f770fd9b-47d2-4b58-b531-9b11a86f505e	TÚI NGÂM CHÂN THẢO DƯỢC	SP NAIL	\N	Cái	\N	t	55000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP622263	\N	\N	\N	\N	t	\N
d4d94149-17c4-44df-8c93-a18fac2bcf40	DẦU GỘI KERASATSE LÀM DÀY TÓC 250ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1600000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636728268	250	ml	\N	\N	t	\N
a5fa6798-e929-4959-b988-543fe938a95c	MÁY KẸP TÓC PHỒNG CHÂN TÓC TỰ NHIÊN  XÁM	MÁY KẸP	\N	Cái	\N	t	330000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP622625	\N	\N	\N	\N	t	\N
30e72874-31b8-4e6b-97ae-c4a86ac06471	MÁY KẸP PHỒNG CHÂN TÓC GẪY NHIỀU ĐEN	MÁY KẸP	\N	Cái	\N	t	380000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP622627	\N	\N	\N	\N	t	\N
6d41f805-c3a3-4b02-9c43-1c738de89adf	MÁY KẸP PHỒNG CHÂN TÓC GẪY NHIỀU LIMITED MÀU HỒNG	MÁY KẸP	\N	Cái	\N	t	500000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP622629	\N	\N	\N	\N	t	\N
eef07d0d-4b9c-45eb-ad44-b3b689507ac6	DẦU GỘI KERASTASE FRESH AFFAIR DRY 233ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1800000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 884486442543	233	ml	\N	\N	t	\N
7ea89186-590c-4377-a399-841d4d38de87	DẦU XẢ OLAPLAEX SỐ 5 1000ML	CHĂM SÓC OLAPLEX	\N	Chai	\N	t	2400000	0	\N	\N	\N	\N	Thương hiệu: Olaplex\nSKU: 850018802451	1000	ml	\N	\N	t	\N
58929763-1d54-4152-929a-97ae89a8e3b7	XỊT CÂN BẰNG PH SINKO 220ML	A HẢI	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8938923670203	\N	\N	\N	\N	t	\N
01723ead-fd3c-4df9-a00c-247b3aa25db7	UV NEON LIME TWIST NO.T-6 200ML	Cty TNG	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 6974577170036	\N	\N	\N	\N	t	\N
f7b538ce-92a8-4de5-b549-200b14d4f03d	UV NEON CANARY YELLOW NO.Y-3 200ML	Cty TNG	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 6974577170029	220	ml	\N	\N	t	\N
ffac4d1f-eaf8-46e3-82b9-ef37f0907825	UV NEON ORANGE NO.O-9 200ML	Cty TNG	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 6974577170067	\N	\N	\N	\N	t	\N
e8628cc7-70ac-4e93-b9ac-eba91199695d	PHỤC HỒI MILBON GRAND LINKAGE 1+	Kỹ Thuật Milbon	\N	Túi	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8859064650254	600	ml	\N	\N	t	\N
0db29f36-0d8a-4de1-a9a7-85d3cab06cb4	PHỤC HỒI MILBON GRAND LINKAGE 2	Kỹ Thuật Milbon	\N	Túi	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8859064650278	600	ml	\N	\N	t	\N
45e23bd2-ae28-4b12-a46e-184e07319a6e	PHỤC HỒI MILBON GRAND LINKAGE 3+	Kỹ Thuật Milbon	\N	Túi	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8859064650292	600	ml	\N	\N	t	\N
e702ef89-f039-438a-abde-722fb5b418a3	MÀU NHUỘM TOPCHIC 6A-250ml	KỸ THUẬT GOLDWEL	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: SP632191	250	ml	\N	\N	t	\N
1666bcde-ebad-47b2-97b8-3ef7a892242a	PHÍM CHE HÓI (NHỎ)	PHÍM TÓC, TÓC MÁI	\N	Cái	\N	t	2500000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP633906	\N	\N	\N	\N	t	\N
6421601d-d0e2-4fd1-8853-930c1bb57fb8	PHÍM BÁT	PHÍM TÓC, TÓC MÁI	\N	Cái	\N	t	1500000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP634048	\N	\N	\N	\N	t	\N
cdb1a16e-2846-45e4-843d-8305cd146e32	DẦU GỘI KERASTASE CHOROMA ABOSOLU  250ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1150000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474637059248	250	ml	\N	\N	t	\N
16c9bdd3-3179-407b-bd50-b7badc33a647	KEM DƯỠNG DA FLOWER LOTION GREENERY FIG 50ML	SP NAIL	\N	Tuýp	\N	t	250000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8809784647096	\N	\N	\N	\N	t	\N
82477b2c-ec63-498c-9d4f-072587196916	XỊT DƯỠNG TÓC DIỆU KỲ MIRACLE LEAVE IN 59ML	CHĂM SÓC TÓC DAVINES	\N	Chai	\N	t	327000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 898571001546	59	ml	\N	\N	t	\N
fce65995-2758-4a7c-8684-2908d6a35a7a	MÁY SẤY CHARMVIT	MÁY KẸP	\N	Cái	\N	t	1260000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP639774	\N	\N	\N	\N	t	\N
e140e796-47a9-498d-a80f-1483e95e6cc5	MÁY KẸP HAIR STRAIGHTENER	MÁY KẸP	\N	Cái	\N	t	1680000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP641725	\N	\N	\N	\N	t	\N
d41a1adb-144c-4cbd-b806-25d7a0a79979	XỊT DƯỠNG TÓC DIỆU KỲ  MIRACLE LEAVE IN 120ML	CHĂM SÓC TÓC DAVINES	\N	Chai	\N	t	529000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 89857100198	120	ml	\N	\N	t	\N
30ebe313-c274-4e31-b3a1-137fdd0453e3	TẨY TBC KERASTASE 250G	CHĂM SÓC KERASTASE	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 347436757039	\N	\N	\N	\N	t	\N
093b885c-5cfb-49a9-b27c-e80202f9603a	DẦU DƯỠNG PURIFYING GEL 150ML	CHĂM SÓC TÓC DAVINES	\N	Tuýp	\N	t	572000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 8004608282099	150	ml	\N	\N	t	\N
d5f6bd3a-5159-4d96-8e56-9fb1ca5c3bc4	DẦU GỘI REBALACING 1000ML	CHĂM SÓC TÓC DAVINES	\N	Chai	\N	t	1083000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 8004608279358	1000	ml	\N	\N	t	\N
5b7844ae-f798-4b9a-b646-94feb2ff78a5	GRAND LINKAGE 3X	Kỹ Thuật Milbon	\N	Túi	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8859064650308	\N	\N	\N	\N	t	\N
41fb4405-5976-4ddc-ae0f-c67243af0332	MẶT NẠ KERASTASE CHROMA ABSOLU GIỮ MÀU 200ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1600000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474637059132	\N	\N	\N	\N	t	\N
8d25c1d2-b614-4ce5-876a-5e219b56bd9e	HẤP KERASTASE CHORONOLOGISTE 200ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	2200000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474636728299	\N	\N	\N	\N	t	\N
35e92e07-5f9d-4971-9c76-d8676e548037	DẦU GỘI JOICO TÍM 1L / 2644392	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1550000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469513364	1000	ml	\N	\N	t	\N
982e7e83-7313-4cef-90d5-fbcfff54364c	DƯỠNG CHẤT KERASTASE KÍCH MỌC TÓC 30*6ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	4769000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636356003	\N	\N	\N	\N	t	\N
4f096abd-b1d1-4d0f-abb4-dca9e34603c7	DẦU GỘI DÀNH CHO TÓC NHUỘM MÀU NÂU 300ML	CHĂM SÓC LAKME	\N	Chai	\N	t	610000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8429421442121	\N	\N	\N	\N	t	\N
a6672e56-7517-478c-99a7-f63c4e360b42	DẦU  XẢ DÀNH CHO TÓC NHUỘM MÀU NÂU 250ML	CHĂM SÓC LAKME	\N	Chai	\N	t	880000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8429421442220	\N	\N	\N	\N	t	\N
4f117c97-614f-417b-8974-1623a3165203	B7- NB	Kỹ Thuật Milbon	\N	Tuýp	\N	t	260000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP662218	\N	\N	\N	\N	t	\N
c24a2c0d-506a-431d-8a67-ab9e34016c63	DẦU GỘI KERASTASE CHORONLOGISTE 1000ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	5200000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474630687103	1000	ml	\N	\N	t	\N
eee0d707-fafc-44cd-825e-e189cb51e194	DẦU GỘI KERASTASE SUÔN MƯỢT 1000ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	3200000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474630647534	1000	ml	\N	\N	t	\N
d02070dd-3185-4d70-9689-ad4e34254c96	HẤP KERASTASE TĂNG CƯỜNG ĐỘ BÓNG 500M	CHĂM SÓC KERASTASE	\N	Chai	\N	t	3100000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 347463614202	500	ml	\N	\N	t	\N
e3ce59f3-8b32-4726-b359-1b97075934e4	DẦU XÃ KERASTASE KÍCH MỌC TÓC 1000ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	4400000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474636356058	\N	\N	\N	\N	t	\N
9f19504a-1d02-41a3-8110-3b824404158d	DẦU GỘI KERASTASE DENSIFIQUE 1000ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	5200000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636356072	1000	ml	\N	\N	t	\N
8fb156af-efd6-4ac1-bc55-03ac028acd9b	MR -DẦU DƯỠNG OIL 15ML	CHĂM SÓC TÓC Moroccanoil	\N	Chai	\N	t	346000	0	\N	\N	\N	\N	Thương hiệu: Moroccanoil\nSKU: 7290013627476	15	ml	\N	\N	t	\N
5431a787-96fe-4821-998b-f895ba54155f	JC- DẦU XẢ PHỤC HỒI ĐỘ ẨM MOISTURE 1000ml	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1250000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469513890	1000	ml	\N	\N	t	\N
d9279dfe-1a11-4dc8-a2f1-7c5050b283c1	Dầu gội Joico K-pak Color Therapy phục hồi giữ màu nhuộm 1000ml / 2571124	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1250000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469516532	1000	ml	\N	\N	t	\N
285a8768-213f-4d86-a594-ae73968ed490	DẦU XÃ  AVEDA INVATI LIGHT 200ML	CHĂM SÓC AVEDA	\N	Tuýp	\N	t	1225000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084977316	200	ml	\N	\N	t	\N
6850cdee-ed51-45a6-8e86-285312a6d2e8	DẦU GỘI AVEDA INVATI LIGHT 200ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1055000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084016510	200	ml	\N	\N	t	\N
b7c48263-8da8-48e6-8f19-e7505b9133cc	DẦU GỘI AVEDA GIÚP TÓC BỀN MÀU COLOR 200ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	890000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084037171	200	ml	\N	\N	t	\N
0e40214e-35e9-48c8-9b9f-536fe1dd7e67	DẦU XẢ AVEDA GIÚP TÓC BỀN MÀU COLOR 200ML	CHĂM SÓC AVEDA	\N	Tuýp	\N	t	1070000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084037331	200	ml	\N	\N	t	\N
1f7e7dae-f837-4270-ae73-b41f2313a1d7	DẦU XẢ AVEDA GIẢM RỤNG TÓC INVATI ADVANCED 1L	CHĂM SÓC AVEDA	\N	Chai	\N	t	4575000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084977323	1000	ml	\N	\N	t	\N
58ccfbd6-ca97-4cb7-b209-d2fa1bbff2ed	MẶT NẠ AVEDA GIẢM RỤNG TÓC INVATI ADVANCED 150ML	CHĂM SÓC AVEDA	\N	Tuýp	\N	t	1480000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084022962	150	ml	\N	\N	t	\N
59da3e3f-df57-4702-94de-3d1d007eb3d7	DẦU GỘI AVEDA DÀNH CHO NAM IVATI 250ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1095000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084961438	200	ml	\N	\N	t	\N
4a7cd32e-f5bf-4556-a996-925effbddcf4	BỌT TẠO KIỂU AVEDA  INVATI ADVANCED 150ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1055000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084030950	150	ml	\N	\N	t	\N
5e929242-0741-40cf-9823-66bc683ce5d3	DẦU GỘI AVEDA GIẢM RỤNG INVATI ADVANCED LIGHT 1000ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	4095000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084016527	1000	ml	\N	\N	t	\N
0c955a9b-8848-4740-bb04-ed020bd5cf6d	DẦU GỘI AVEDA GIẢM RỤNG TÓC INVATI ADVANCED RICH 1000ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	4095000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084016831	1000	ml	\N	\N	t	\N
eaac4a3f-4cef-4454-b5e6-0e132f20b9b4	SERUM AVEDA BOTANICAL REPAIR 100ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1480000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084019610	100	ml	\N	\N	t	\N
b2c95853-71cf-44fc-86de-c5ebebdb8a3b	MẶT NẠ AVEDA BOTANICAL REPAIR RICH 200ML	CHĂM SÓC AVEDA	\N	Hũ	\N	t	1980000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084019337	200	ml	\N	\N	t	\N
b4c9aa4f-fff0-4195-af6f-986216f87b4f	MẶT NẠ AVEDA BOTANICAL REPAIR RICH 450ML	CHĂM SÓC AVEDA	\N	Hũ	\N	t	3555000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084019344	450	ml	\N	\N	t	\N
78fa8b58-071b-4696-96d0-1ad6239ec8ab	DẦU GỘI AVEDA BOTANICAL REPAIR 1000ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	4095000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084019498	1000	ml	\N	\N	t	\N
0a3002c2-6b3a-4647-80ad-131852a6ffb6	DẦU GỘI AVEDA BOTANICAL REPAIR 200ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1055000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084019481	200	ml	\N	\N	t	\N
455cf237-8eed-44c5-aa6e-2450fc3238e7	DẦU XẢ AVEDA BOTANICAL REPAIR 1000ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	4575000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084019542	1000	ml	\N	\N	t	\N
816c9105-9d81-470b-b3a3-77c18d20df8d	MẶT NẠ AVEDA BOTANICAL REPAIR LIGHT 150ML	CHĂM SÓC AVEDA	\N	Tuýp	\N	t	1480000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084019306	150	ml	\N	\N	t	\N
31089fb3-ab89-4c19-bc67-7b1b14139f05	DẦU GỘI AVEDA NUTRI PLENISH DEEP 1000ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	3585000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084014431	1000	ml	\N	\N	t	\N
dc9de14b-ac98-43f1-806a-664d246856b3	DẦU XẢ AVEDA NUTRI PLENISH DEEP 1000ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	4065000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084014486	1000	ml	\N	\N	t	\N
0e677c97-17b8-4737-a91f-107d48128b23	DẦU XẢ AVEDA NUTRI PLENISH LIGHT 1000ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	4065000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084014387	1000	ml	\N	\N	t	\N
1d4cad23-4d7c-4b81-af92-a6b4842856a6	MẶT NẠ AVEDA NUTRI PLENISH LIGHT 150ML	CHĂM SÓC AVEDA	\N	Tuýp	\N	t	1480000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084035856	150	ml	\N	\N	t	\N
bce9e8ba-b403-4996-bd2f-449be4a13404	DẦU XẢ AVEDA NUTRI PLENISH DEEP 250ML	CHĂM SÓC AVEDA	\N	Tuýp	\N	t	1225000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084014479	250	ml	\N	\N	t	\N
2abf276c-e46f-47aa-898d-0dc51d4bc569	MẶT NẠ AVEDA NUTRI PLENISH DEEP 200ML	CHĂM SÓC AVEDA	\N	Hũ	\N	t	1975000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084036020	200	ml	\N	\N	t	\N
0cb47e17-2b0b-46f6-a4a7-67dfe3ad538c	DẦU GỘI  AVEDA NUTRI PLENISH LIGHT 250ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1055000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084014325	250	ml	\N	\N	t	\N
a5cbce31-dffa-4dba-b4ea-ee6210283a61	DẦU GỘI AVEDA NUTRI PLENISH DEEP 250ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1055000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084014424	250	ml	\N	\N	t	\N
4174df2f-5605-43df-97f3-1b8440416768	DẦU XẢ KHỔ AVEDA NUTRI PLENISH LEAVE IN 200ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1285000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084014516	200	ml	\N	\N	t	\N
a37adc17-3222-42f1-a4bf-ce27055504ed	TINH DẦU CHAKRA 5 100ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1200000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084986752	100	ml	\N	\N	t	\N
65030dad-242c-4e0b-ae48-8cbe2e579558	TINH DẦU CHAKRA 4 100ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1200000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 18084986745	100	ml	\N	\N	t	\N
9c06f176-4b9d-423d-a748-55416344c156	TINH DẦU CHAKRA 3 100ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1200000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084986738	100	ml	\N	\N	t	\N
64003b81-5656-453a-a9f6-690ea8d6d77a	TINH DẦU CHAKRA 1 100ml	CHĂM SÓC AVEDA	\N	Chai	\N	t	1200000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084986653	100	ml	\N	\N	t	\N
5e246a1a-ba35-4c20-8ffa-23649f207428	TINH DẦU CHAKRA 7 100ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1200000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084986776	100	ml	\N	\N	t	\N
8b533287-7a6e-435b-aef2-651957c04dbb	TINH DẦU CHAKRA 6 100ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1200000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084986769	100	ml	\N	\N	t	\N
8236e4c3-1a33-4d7f-921c-ea5f30b9ca4b	DẦU XẢ SHAMPURE 250ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	880000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084998083	250	ml	\N	\N	t	\N
7d4efacd-ed08-4343-b1e3-dcf8892d8b13	DẦU GỘI SHAMPURE 250ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	715000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084998045	250	ml	\N	\N	t	\N
c1428b84-e891-42ee-b444-2c368c2e32ca	DẦU GỘI SHAMPURE 1000ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	2380000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084998052	1000	ml	\N	\N	t	\N
c5622b16-2c8a-43d0-99e6-349e2c47e73c	DẦU XẢ ROSEMARY MINT 250ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	880000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084998182	250	ml	\N	\N	t	\N
e284db93-98a2-4a0e-848f-097c129ca5bd	DẦU GỘI ROSEMARY MINT 250ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	695000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084998144	250	ml	\N	\N	t	\N
d2fdc9cc-094b-41f2-80c4-d2f95017a877	DẦU XẢ ROSEMARY MINT 1000ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	2660000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084998199	1000	ml	\N	\N	t	\N
d9041205-b5f4-437d-922d-24a3da40e671	DẦU GỘI ROSEMARY MINT 1000ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	2380000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084998151	1000	ml	\N	\N	t	\N
18e9950a-1052-4d6a-9698-4ddcb3fcf5b8	TẠO KIỂU AVEDA PURE ABUNDANCE 100ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1035000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084908174	100	ml	\N	\N	t	\N
f6164ad2-59f9-4131-8050-f7081bd610e5	DẦU XẢ ĐẤT SÉT AVEDA PURE ABUNDANCE 200ML	CHĂM SÓC AVEDA	\N	Tuýp	\N	t	995000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084829202	200	ml	\N	\N	t	\N
30e24b0d-6a6f-4f91-9bb0-e624171c2f30	DẦU GỘI AVEDA PURE ABUNDANCE 250ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	915000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084829226	250	ml	\N	\N	t	\N
b9c1b40e-4315-442e-88d4-2bd2dea471fc	DẦU GỘI AVEDA PURE ABUNDANCE 1000ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	2890000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084829233	1000	ml	\N	\N	t	\N
f5ada923-1ed9-4100-850f-b2fe1ffefab4	DẦU GỘI AVEDA CHERRY ALMOND 1000ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	2280000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084997451	1000	ml	\N	\N	t	\N
f8b2f830-3797-492d-a44f-e46b250ba90e	DẦU XẢ AVEDA CHERRY ALMOND 1000ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	3315000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084997482	1000	ml	\N	\N	t	\N
7b44fedf-c982-4719-a012-4fcc6b1c9685	DẦU GỘI  AVEDA CHERRY ALMOND 250ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	715000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084997444	250	ml	\N	\N	t	\N
c2a2bd6f-1c05-4c89-9548-79988e60c24b	DẦU XẢ  AVEDA CHERRY ALMOND 200ML	CHĂM SÓC AVEDA	\N	Tuýp	\N	t	880000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084997475	200	ml	\N	\N	t	\N
c2d00fc3-0171-4bf1-bba0-4f93eff33cb0	GEL TẠO KIỂU NAM AVEDA  PURE FORMANCE 150ML	CHĂM SÓC AVEDA	\N	Tuýp	\N	t	1040000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084857489	150	ml	\N	\N	t	\N
95453569-f1ef-4945-9b80-4fd65f6fd72d	DẦU GỘI  NAM AVEDA  PURE FORMANCE 300ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	915000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084850930	300	ml	\N	\N	t	\N
6b84bae7-8eac-4f0d-bc73-47caef751c84	DẦU XẢ  NAM AVEDA  PURE FORMANCE 300ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1070000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084850985	300	ml	\N	\N	t	\N
f3a41af4-d9d5-46f7-84be-0975443ed29e	DẦU GỘI  NAM AVEDA  PURE FORMANCE 1000ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	2395000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084915646	1000	ml	\N	\N	t	\N
f78c286a-c34c-4f8f-934f-475cff7af5f3	DẦU XẢ AVEDA  BE CURLY 1000ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	4270000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084844632	1000	ml	\N	\N	t	\N
b7838304-70a1-48ba-acba-cca78e923aea	DẦU XẢ AVEDA  BE CURLY  200ML	CHĂM SÓC AVEDA	\N	Tuýp	\N	t	1075000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084844625	200	ml	\N	\N	t	\N
b364cdc5-543f-4c82-abc9-4e85b2447bae	KEM TẠO KIỂU AVEDA  BE CURLY  100ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1040000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084887417	100	ml	\N	\N	t	\N
013d95db-7fe1-46f4-bf69-84718712afd6	DẦU GỘI AVEDA  BE CURLY  250ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	925000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084844601	250	ml	\N	\N	t	\N
983e3cec-0864-47bf-9749-d7c4d2ccca42	DẦU GỘI AVEDA  BE CURLY  1000ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	2900000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084844595	1000	ml	\N	\N	t	\N
e3a90db5-4759-4f57-acb8-587346d14628	DẦU GỘI AVEDA  COLOR CONTROL   1000ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	3535000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084037188	1000	ml	\N	\N	t	\N
c48eb5aa-e438-424d-8488-126b9d92d444	DẦU XẢ AVEDA  COLOR CONTROL 1000ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	4040000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084037348	1000	ml	\N	\N	t	\N
45bd8662-1d20-402d-9144-237dffe51809	TINH DẦU  AVEDA  BEAUTIFYING 50ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1110000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084820674	50	ml	\N	\N	t	\N
845f9523-91ae-4bd1-acb5-7203342fe2ab	TINH DẦU AVEDA COOLING 50ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	2016000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084977002	50	ml	\N	\N	t	\N
429b88f3-023a-45fa-ac58-52630947d2b7	DẦU GỘI AVEDA  SMOOTH INFUSION 200ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	915000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084037416	200	ml	\N	\N	t	\N
e51e8f93-3f6d-4490-947f-4916183755fd	DẦU XẢ AVEDA  SMOOTH INFUSION  200ML	CHĂM SÓC AVEDA	\N	Tuýp	\N	t	1070000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084037454	200	ml	\N	\N	t	\N
def21252-b5af-4757-b05c-f55fa6f7f05a	TẠO KIỂU AVEDA  SMOOTH INFUSION  200ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1140000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084037539	200	ml	\N	\N	t	\N
26afb93c-3a31-41e2-8b99-fa788a78177f	KEM TẠO KIỂU AVEDA  SMOOTH INFUSION 150ML	CHĂM SÓC AVEDA	\N	Tuýp	\N	t	1140000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084039427	150	ml	\N	\N	t	\N
69c6c2a9-2e0f-4a9a-ba26-b38b337b8a35	TINH DẦU AVEDA STRESS FIX 50ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1120000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084950081	50	ml	\N	\N	t	\N
8e15f359-3dfe-4ccc-9e76-baca1fd22051	TINH DẦU SHAMPURE 50ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1120000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084945315	50	ml	\N	\N	t	\N
42542dbc-f9dc-43f9-943b-a15904e44a59	TINH DẦU AVEDA COOLING 7ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	745000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084976999	7	ml	\N	\N	t	\N
4b9284f6-656d-438a-8110-4a93dda8d0fc	TINH DẦU AVEDA STRESS FIX 7ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	780000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084908235	7	ml	\N	\N	t	\N
3c062c8a-afd2-485d-8d89-27b97a1eafa6	TẠO KIỂU AVEDA TEXTURE TONIC 125ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	955000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084981047	125	ml	\N	\N	t	\N
70235936-144e-4124-9ad2-d56fa77c9197	TẠO KIỂU AVEDA THICKENING TONIC 100ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	955000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084936757	100	ml	\N	\N	t	\N
c01bda63-5b43-462b-aee6-5d50966dbbe5	XỊT DƯỠNG AVEDA VOLUMIZING TONIC 100ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	955000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084891650	100	ml	\N	\N	t	\N
a85d52ef-dda1-4f36-8cf1-dcd97d6427fe	KM DƯỠNG DA TAY AVEDA HAND RELIEF 125ML	CHĂM SÓC AVEDA	\N	Tuýp	\N	t	825000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084877609	125	ml	\N	\N	t	\N
89a61a9d-f118-4a63-b400-2337314e7a1a	TẠO KIỂU AVEDA CONTROLFORCE 300ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1085000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084846933	300	ml	\N	\N	t	\N
4609b886-65fe-49fa-b232-4be094cd9b2e	TẠO KIỂU AVEDA AIRCONTROL 300ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1100000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084836552	300	ml	\N	\N	t	\N
d36829f6-ca76-4b4b-88d0-4f3c484627c9	SÁP TẠO KIỂU AVEDA MEN PURE FORMANCE 75ML	CHĂM SÓC AVEDA	\N	Hũ	\N	t	1095000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084973523	75	ml	\N	\N	t	\N
cafd0df9-9e02-4be9-a011-c1009da0ca5e	SPS MÊM AVEDA MEN 75ML	CHĂM SÓC AVEDA	\N	Hũ	\N	t	1040000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084851036	75	ml	\N	\N	t	\N
8527637b-c03c-4c44-9907-921d9100ab2a	GW-XỊT DƯỠNG KERASILK COLOR 125ML	CHĂM SÓC GOLDWELL	\N	Chai	\N	t	700000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609652434	125	ml	\N	\N	t	\N
cf3f624a-f71c-4098-bd5c-741cf361e018	TINH DẦU AVEDA NUTRI PLENISH30ml	CHĂM SÓC AVEDA	\N	Chai	\N	t	1480000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084015810	30	ml	\N	\N	t	\N
05e1a996-f2c8-4e8f-b28b-40f0f3101971	MẶT MẠ PHỤC HỒI AVEDA BOTANICAL LIGHT 350ml	CHĂM SÓC AVEDA	\N	Tuýp	\N	t	2785000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084019276	350	ml	\N	\N	t	\N
4445c806-f232-4c3c-9da4-46e862f504c0	DẦU XẢ KHÔ AVEDA BOTANICAL REPAIR 100ml	CHĂM SÓC AVEDA	\N	Tuýp	\N	t	1280000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084019580	100	ml	\N	\N	t	\N
d74d363e-d5cf-476d-87d1-42d0eadad311	DẦU GỘI GIẢM RỤNG AVEDA INVATI ADVANCED RICH 200ml	CHĂM SÓC AVEDA	\N	Chai	\N	t	1055000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084016824	200	ml	\N	\N	t	\N
53f204a3-48af-4135-ad03-0283a85aff13	SERUM KÍCH MỌC TÓC AVEDA INVATI MEN 125ml	CHĂM SÓC AVEDA	\N	Chai	\N	t	2160000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084961421	125	ml	\N	\N	t	\N
3ed846c1-224a-46cd-b515-6e4af6d64d64	SERUM KÍCH MỌC TÓC AVEDA INVATI ADVANCED 150ml	CHĂM SÓC AVEDA	\N	Chai	\N	t	2380000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084977347	150	ml	\N	\N	t	\N
2704bedb-856e-41fd-829f-f3295c24d1aa	JOICO KEM NHUỘM LS 9BA - XÁM KHÓI	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469500777	\N	\N	\N	\N	t	\N
225e911a-7380-4299-9c02-babac8e146a6	JOICO KEM NHUỘM TÓC LS 10BA - MÀU XÁM KHÓI	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469500760	100	ml	\N	\N	t	\N
46d1b30d-4119-4564-9ae1-d2b62ac4ce16	KEM NHUỘM TÓC VKC AGE DEFY 6NR MÀU TỰ NHIÊN ÁNH ĐỎ	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469500753	\N	\N	\N	\N	t	\N
7eb724b3-74c4-4c89-82b8-302516cff576	LD MAX 22/88888 BLIE BLACK	Cty TNG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8032853531631	\N	\N	\N	\N	t	\N
2606d1ff-50ba-4e63-bcfd-ec75a6a208bd	LD MAX 7/11111 FOG DARK GREY	Cty TNG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8032853531631	\N	\N	\N	\N	t	\N
80eb3c26-c159-4158-ace7-e68529225fae	AIMEI TRUE COLOR 6/71	A HẢI	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 6970747786328	\N	\N	\N	\N	t	\N
85d36c6f-d919-41b2-8c02-0d6bb2003a91	UV NEON PINKISSSIMO NO.P 10 200ML	Cty TNG	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 6974577170043	\N	\N	\N	\N	t	\N
3a7c7bb8-db08-485a-a8c5-e33db03264f3	UỐN TÓC YẾU NC PETRA	KỸ THUẬT PETRA	\N	Túi	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP679071	\N	\N	\N	\N	t	\N
658070ca-ef27-4adc-bbda-73e2a70cc721	TONER MATCHA MOUSSE 0320A	SẢN PHẨM LÀM ĐẸP	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684008813	\N	\N	\N	\N	t	\N
f472e5b1-0f28-4151-8796-6cf9d35396c1	SKYRED OX5	Cty TNG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP679083	\N	\N	\N	\N	t	\N
eafd781f-694a-4710-8106-271c1e11a782	PHỦ BÓNG LM043	PHỦ BÓNG HQ	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP679263	\N	\N	\N	\N	t	\N
077c3b2c-2a22-4c56-9668-e5ec27ddeaa0	PHỦ BÓNG LM022	PHỦ BÓNG HQ	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP679264	\N	\N	\N	\N	t	\N
f286be88-805a-424b-adb3-98bce5c6558f	DẦU GỘI LABAX B5 DAILY NUTRI SMOOTH  4000ML	A HẢI	\N	Can	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8938523670091	5000	ml	\N	\N	t	\N
e99130aa-3ab4-499c-ab96-470e04f3314a	XỊT GIỮ NẾP CỨNG BUTTERFLY SHADOW	A HẢI	\N	Chai	\N	t	250000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 6942681232350	\N	\N	\N	\N	t	\N
9a9f64f1-60eb-4705-84b8-41e8095b278d	KEM NHUỘM RIGHT 4.111	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182690947	100	ml	\N	\N	t	\N
f4014606-e74b-4354-abfc-05f034ec6e56	KEM NHUỘM RIGHT 6.111	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182690954	\N	\N	\N	\N	t	\N
1e5b3e59-a7ea-4509-915b-6a8a1c7e5886	KEM NHUỘM RIGHT 8.111(1SG)	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182690565	\N	\N	\N	\N	t	\N
d25ef02a-c2da-42b2-a2ea-69274ba5c345	KEM NHUỘM RIGHT 10.111	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182690985	\N	\N	\N	\N	t	\N
3e1b78dd-24ba-4713-ba82-da1b7d4691b4	KEM NHUỘM RIGHT BOOSTER	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182690619	\N	\N	\N	\N	t	\N
e56265c4-fea8-4614-bdbc-316d1f106b07	KEM NHUỘM  RIGHT ROSA INTENSO	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182690626	\N	\N	\N	\N	t	\N
24e3859d-c6b1-4a86-8802-ded23e2ca3b2	KEM NHUỘM RIGHT GIALLO CALDO	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182690633	100	ml	\N	\N	t	\N
b1887b8c-80d6-40ac-843c-5d1b57a4e676	KEM NHUỘM RIGHT 5.111(2SG)	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182690572	\N	\N	\N	\N	t	\N
5a81ad99-b82b-44a7-9993-b82152669deb	KEM NHUỘM TÓC .526	KỸ THUẬT AFFINAGEINFINITI	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 9329633007769	\N	\N	\N	\N	t	\N
cdebb876-46f7-4c87-adaa-e8585635d0d2	KEM NHUỘM RIGHT 12.2	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182690862	100	ml	\N	\N	t	\N
5d22fef0-b309-4dc7-9849-ee7d9bf981e5	KEM NHUỘM RIGHT 7.12	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182690886	\N	\N	\N	\N	t	\N
3d0ed16a-210e-4c87-aff9-a0c8c6a02a80	KEM NHUỘM RIGHT 12.12	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182690930	\N	\N	\N	\N	t	\N
a19e4af7-17f0-445f-8c4c-e1aae8729d78	KEM NHUỘM RIGHT 8.12	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182690893	\N	\N	\N	\N	t	\N
4d17caf4-b176-4b2b-969f-270810f92c16	KEM NHUỘM RIGHT 8.233	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182691135	\N	\N	\N	\N	t	\N
8ac69b16-a0d9-4194-beb3-6135e86403e9	KEM NHUỘM RIGHT 6.233	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182691111	\N	\N	\N	\N	t	\N
52d75790-4478-40e7-8c4e-5c10ec2e564d	KEM NHUỘM RIGHT 6.12	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182690879	\N	\N	\N	\N	t	\N
4268130e-00bf-4144-bd12-15322564ad67	KEM NHUỘM RIGHT 10.12	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182690916	\N	\N	\N	\N	t	\N
6142f316-3248-4055-8598-850cc87daecb	LAD.FECI 2	LAD.FECI	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 6970930863478	\N	\N	\N	\N	t	\N
13cce9da-829c-4d1f-a088-dcd7b0791900	STRAWBERRY POP	KỸ THUẬT DORADO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684008790	\N	\N	\N	\N	t	\N
67d0f4e4-0799-4c28-990e-7b3a329afab2	DORADO CREAM 8N	KỸ THUẬT DORADO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684009070	\N	\N	\N	\N	t	\N
c7e20f22-d268-44f6-8eff-00a7f4b993e4	KEM NHUỘM NÂNG SÁNG MÀU RÊU L33	KỸ THUẬT SCHWARZKOPF	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 4045787390063	\N	\N	\N	\N	t	\N
99b4edf5-b474-4d10-b89e-670877cb95d0	PERMANENT COLOR CREAM GREEN	KỸ THUẬT VŨ LỘC	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8033162571202	\N	\N	\N	\N	t	\N
1a6a1722-75fe-4079-8a5c-92980331db22	PERMANENT COLOR CREAM 5.01	KỸ THUẬT VŨ LỘC	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8033162570137	\N	\N	\N	\N	t	\N
e84f52fc-4b38-45be-886d-6e612583c7a1	PERMANENT COLOR CREAM 6.01	KỸ THUẬT VŨ LỘC	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8033162570144	\N	\N	\N	\N	t	\N
4b77eed2-7f71-4c29-825c-4c258656d02a	PERMANENT COLOR CREAM 7.01	KỸ THUẬT VŨ LỘC	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8033162570151	100	ml	\N	\N	t	\N
400c5d85-7539-4664-b7e2-1599101e4347	KEM NHUỘM RIGHT 8.41	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182690411	\N	\N	\N	\N	t	\N
9f6176bb-47bc-4e27-a6cd-60daf35ab9c7	KEM NHUỘM NÂNG SÁNG L-77 MÀU ĐỒNG	KỸ THUẬT SCHWARZKOPF	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 4045787389708	\N	\N	\N	\N	t	\N
b5fe6340-8630-409b-ad9d-5f5ecb8fabae	KEM NHUỘM affinage .4 COPPER	KỸ THUẬT AFFINAGEINFINITI	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 9329633007752	\N	\N	\N	\N	t	\N
14872f55-ccb1-4a23-b03f-4e9b5d9016e7	KEM NHUỘM .526 MAGENTA	KỸ THUẬT AFFINAGEINFINITI	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 932963300779	\N	\N	\N	\N	t	\N
074a0256-dd3f-45a7-9c33-b9a9d122808c	KEM NHUỘM .64 RED COPPER	KỸ THUẬT AFFINAGEINFINITI	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 9329633007745	\N	\N	\N	\N	t	\N
cd264643-366a-4084-ac5b-10ff4d96cc38	KEM NHUỘM .62 RED VLOLET	KỸ THUẬT AFFINAGEINFINITI	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 9329633007776	\N	\N	\N	\N	t	\N
c62d6ff1-66d4-467a-a44a-ed801cbe9e15	KEM NHUỘM affinage .6 RED	KỸ THUẬT AFFINAGEINFINITI	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 9329633007738	\N	\N	\N	\N	t	\N
315aab79-546b-419a-9cdc-01bd8fb1b170	MÀU NHUỘM TÓC B9-NB	Kỹ Thuật Milbon	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8859064603465	\N	\N	\N	\N	t	\N
05e8f474-0d43-4c67-8a6a-bcc3be90b160	CHROMA SILK MYSTICAL MINT	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438382797	\N	\N	\N	\N	t	\N
59320dac-82f9-4f27-bd8f-a02f5104304f	CHROMA SILK PASTELS	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 7501438382773	\N	\N	\N	\N	t	\N
d9aedcfd-2db7-4a33-93f6-87b8715281bf	CHROMA SILK  ROSE GOLD	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438386665	\N	\N	\N	\N	t	\N
9cd66fc4-78b6-4801-858c-2cdd603d8d61	CHROMA SILK NATURAL	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 7501438384883	\N	\N	\N	\N	t	\N
d4250910-ed89-4138-93f9-4f47882c1368	KEM NHUỘM RG 10.23	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182690817	\N	\N	\N	\N	t	\N
1fc15cad-0d06-4435-9e35-fe2a47060bb1	CHROMASILK NEON PINK	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 7501438384371	\N	\N	\N	\N	t	\N
066a6405-db78-4bd7-b44c-037610c6580a	CHROMASILK LUSCIOUS LAVENDER	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 7501438382759	\N	\N	\N	\N	t	\N
1c1730c2-1c9d-4562-ac02-e2542ca87362	CHROMASILK LOCKED-IN YELLOW	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 750143838760	\N	\N	\N	\N	t	\N
1e2a7d4c-7b2e-4d1b-9e9c-b8809cbb329c	KEM NHUỘM RIGHT 5.233	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182690510	\N	\N	\N	\N	t	\N
7fa98800-a2dc-4c86-92d7-c633d6201715	CHROMASILK LOCKE-IN YELLOW	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 7501438384760	\N	\N	\N	\N	t	\N
e86e5e98-7836-4b1c-bb21-e7a984eb09e9	DẦU XẢ BỔ SUNG SẮC TỐ TÍM 250ml / 2620519	CHĂM SÓC TÓC JOICO	\N	Tuýp	\N	t	620000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469513357	250	ml	\N	\N	t	\N
fa89c901-dc15-4ebb-b173-2dbabf732a27	DẦU GÔI BỔ SUNG SẮC TỐ TÍM VIOLET 300ML / 2644391	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	620000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469513340	300	ml	\N	\N	t	\N
a08c1356-80f8-4623-8c44-5e2e8175b989	DẦU XẢ JOICO TÍM 1L / 2644390	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1550000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469513371	1000	ml	\N	\N	t	\N
a5616e31-5c27-4589-abfe-4ea8dd4f3d01	OXY VKC 30VOL 9%	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469442817	1000	ml	\N	\N	t	\N
36a64c9f-6955-4d68-ba84-d1e7cf5b7e32	OXY VKC 20VOL 6%	KỸ THUẬT JOICO	\N	Chai	\N	t	520000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469442794	1000	ml	\N	\N	t	\N
6f382844-d23d-437d-83d0-0fee3c8760e5	KEM NHUỘM RG 9.12	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP681777	\N	\N	\N	\N	t	\N
9e3979d5-e694-4df0-8bec-d664eab134ba	KEM NHUỘM RG 7.233	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182691128	\N	\N	\N	\N	t	\N
4a8884b4-7e97-4f7a-b5a3-e9de74216627	KEM NHUỘM RG 9.111	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP681782	\N	\N	\N	\N	t	\N
893b310d-b062-4df2-84ee-5643484452e6	KEM DƯỠNG AVEDA 3 BOTANICAL REPAIR  RICH 350ml	CHĂM SÓC AVEDA	\N	Tuýp	\N	t	2785000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084019283	350	ml	\N	\N	t	\N
966fbab6-57a0-4e2e-b62e-db911eaec22d	TINH CHẤT  AVEDA LÀM SẠCH DA ĐẦU 150ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1120000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084977118	150	ml	\N	\N	t	\N
2f53155d-f4b8-4869-b81c-4bc044043741	KEM DƯỠNG BẢO VỆ TÓC BƯỚC 2 BOTANICAL REPAIR 500ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084018606	500	ml	\N	\N	t	\N
e3c17808-fce4-4a28-9fa9-5be82ca36ff7	BỌT TẠO KIỂU THICKENING FOAM Hàng tặng	CHĂM SÓC AVEDA	\N	Chai	\N	t	1055000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084030967	150	ml	\N	\N	t	\N
61a85276-f061-4b69-8f0f-6ef9d78d3b32	TINH DẦU XỊT CHAKRA 2 100ml	CHĂM SÓC AVEDA	\N	Chai	\N	t	1200000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084986721	100	ml	\N	\N	t	\N
f357141f-fa4e-48a3-b13b-e8606a9897c7	DẦU XẢ GIẢM GẪY RỤNG AVEDA 1000ml	CHĂM SÓC AVEDA	\N	Chai	\N	t	4575000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084977330	1000	ml	\N	\N	t	\N
1cf93b51-7851-407e-b12a-0517301b1adf	AVEDA TẨY TẾ BÀO CHẾT DA ĐẦU PRAMASANA 1L	CHĂM SÓC AVEDA	\N	Chai	\N	t	4973000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084977125	1000	ml	\N	\N	t	\N
dd1aaf14-5282-4f64-88d1-474f8c04e4a4	OXY LUMISHINE 5 VOL (1,5%) 950ML	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP683392	1000	ml	\N	\N	t	\N
f4cfb096-5ce4-48cb-9e64-1dbebe46b70b	MẶT NẠ TÓC MIRACLE IT`S A 10 240ML	CHĂM SÓC TÓC DAVINES	\N	Chai	\N	t	895000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 898571000204	240	ml	\N	\N	t	\N
4e7e1ad5-e0eb-4ad5-95bf-e7734ddf7bfb	KEM NHUỘM RG 6.8	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182690770	\N	\N	\N	\N	t	\N
f252a9bc-e71b-4195-956a-cc0f221ca6ce	DẦU GỘI KARASTASE DÀNH CHO TÓC KHÔ NẶNG 1000ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	3200000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636382422	1000	ml	\N	\N	t	\N
ab99d719-faac-47a2-b553-70a5ae72fe52	MẶT NẶ KERASTASE TRỊ LIỆU, TÁI TẠO 500ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	3100000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474630713109	\N	\N	\N	\N	t	\N
0e58d35a-bb1a-4394-a2d0-c6da2be9051b	LƯỢC GỖ	PHỤ KIỆN	\N	Cái	\N	t	960000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP687246	\N	\N	\N	\N	t	\N
f25ef8fd-e70d-4127-9422-d0f25efe8b10	MÀU NHUỘM TÓC TOPCHIC 6RV	KỸ THUẬT GOLDWEL	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609003823	250	ml	\N	\N	t	\N
49e5cc96-7429-4b6a-8d96-f35943054c78	HAIRCOLOR APRON	CHĂM SÓC AVEDA	\N	Cái	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084042977	\N	\N	\N	\N	t	\N
d9d80b68-24fe-4239-9597-b3a2340c6212	TINH DẦU KERASETASE 100ML ROSE	CHĂM SÓC KERASTASE	\N	Chai	\N	t	2500000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474636624768	\N	\N	\N	\N	t	\N
710e08ff-5ccf-46f3-af2b-ce943d9e8434	TINH CHẤT AVEDA BẢO VỆ DA ĐẦU 75ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1555000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084977132	75	ml	\N	\N	t	\N
15f17b1f-6d92-45e4-aac2-ec581158e6b1	KEM NHUỘM DORADO 1N	KỸ THUẬT DORADO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684009018	\N	\N	\N	\N	t	\N
955f8ce8-35c1-4ac0-9e1f-2c999fb38b47	MẶT NẠ TÓC IT`S A 10   517,5ml	CHĂM SÓC TÓC DAVINES	\N	Chai	\N	t	1359000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 898571000235	517.5	ml	\N	\N	t	\N
506d6672-4567-46a3-b408-0513b9fdba7f	Kem tạo kiểu OSIS+ 150ML	CHĂM SÓC  Schwarzkopf	\N	Chai	\N	t	390000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 4045787670080	\N	\N	\N	\N	t	\N
36227255-99be-41c6-80ca-456ee7e018a7	PHỦ BÓNG LM075	PHỦ BÓNG HQ	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP695449	\N	\N	\N	\N	t	\N
64c62fdc-45ed-4584-834c-c2a0e7af1e7d	LƯỢC CHẢI DA ĐẦU AVEDA PRAMASANA	CHĂM SÓC AVEDA	\N	Cái	\N	t	1070000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084977231	\N	\N	\N	\N	t	\N
638069b5-6ace-450b-adb2-eb0eddf549b7	DẦU XẢ PHỤC HỒI TÓC HƯ TỔN AVEDA BOTANICAL 200ML	CHĂM SÓC AVEDA	\N	Tuýp	\N	t	1225000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084019535	200	ml	\N	\N	t	\N
40659012-608f-4940-a985-6cf2a80a33d2	GW-DẦU HẤP KERASILK RECONSTRUCT 500ML	CHĂM SÓC GOLDWELL	\N	Chai	\N	t	1520000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609652243	500	ml	\N	\N	t	\N
6ff45791-f810-48fa-b48e-0279b7152b93	OXY JOICO VKC 10 3% 950ML	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469442787	1000	ml	\N	\N	t	\N
0b86255d-93ee-4860-98f7-ac56bcc05774	DORADO CREAM 5N 100ML	KỸ THUẬT DORADO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684009049	\N	\N	\N	\N	t	\N
6444272e-0eae-4be3-b159-cb6bd950792c	DẦU XÃ LABAX B5 DAILY NUTRI SMOOTH  4000ML	A HẢI	\N	Can	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8938523670091	5000	ml	\N	\N	t	\N
a8a1e6f2-b9b6-46eb-99e2-7f266d6b7868	DORADO CREAM  4N 100ML	KỸ THUẬT DORADO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684009032	100	ml	\N	\N	t	\N
db3ea8f5-db70-468e-9b7d-c8a232c511ec	DORADO CREAM 3N 100ML	KỸ THUẬT DORADO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684009025	\N	\N	\N	\N	t	\N
819eecca-9bc4-45cd-9f0e-c534295caee9	DORADO CREAM 6N 100ML	KỸ THUẬT DORADO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684009056	\N	\N	\N	\N	t	\N
e576d958-0f2c-4cb7-bb7b-2af904d6220c	THUỐC NHUỘM AVEDA 1NC 80G	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 1NC	80	ml	\N	\N	t	\N
ef4569ee-df42-4bb2-b8a1-6973bf0ecb04	PERMANENT COLOR CREAM 8.01	KỸ THUẬT VŨ LỘC	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: DELC801	\N	\N	\N	\N	t	\N
03f8e546-b0e9-46b2-bf1f-0276636442b3	TC 8SB 250ML	KỸ THUẬT GOLDWEL	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609002369	\N	\N	\N	\N	t	\N
07493458-cc0f-483f-b40d-ed0721135186	TC 7SB 250ML	KỸ THUẬT GOLDWEL	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609003144	\N	\N	\N	\N	t	\N
0f216f4e-0d6d-41cc-a27a-192ecc5f60c0	TC 8A 250ML	KỸ THUẬT GOLDWEL	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609002383	\N	\N	\N	\N	t	\N
d61cde13-98f0-4461-9f07-41e24eb77a8e	TINH DẦU MOROC LIGHT 100ML	CHĂM SÓC TÓC Moroccanoil	\N	Chai	\N	t	1150000	0	\N	\N	\N	\N	Thương hiệu: Moroccanoil\nSKU: 7290116971605	100	ml	\N	\N	t	\N
53b432bf-5643-4435-81bb-a26b8240dc8b	DẦU GỘI NARAXIS SMOOTHING 500ML	CHĂM SÓC NARAXIS	\N	Chai	\N	t	1260000	0	\N	\N	\N	\N	Thương hiệu: NARS\nSKU: 8033064400105	500	ml	\N	\N	t	\N
83a6b765-8fcd-4fee-862d-f55b325c11f4	NARAXIS TINH CHẤT TRỊ GÀU PURIFLYING AMPOULE  7ML*8	CHĂM SÓC NARAXIS	\N	Ống	\N	t	1725000	0	\N	\N	\N	\N	Thương hiệu: NARS\nSKU: 8033064400211	7	ml	\N	\N	t	\N
58995799-adbc-4a7e-9830-efb3572ecc36	VASELINE TINH DAU OIL 200ML	VASELINE	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 305210287303	\N	\N	\N	\N	t	\N
1fa541be-4ccc-4656-94be-d8bfa4601a67	OXY VKC 40VOL 12%	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2831	1000	ml	\N	\N	t	\N
cc5201a8-a902-4c45-bd1b-d21ba9aa6790	HAIR SHAKE- xịt tạo kiểu tăng phồng 150ml / 2899979	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	590000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469523042	150	ml	\N	\N	t	\N
51b0d0de-c826-40e2-9a72-be4429923dd4	DẦU XẢ NUTRITIVE CẤP ẨM 1000ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	3400000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474637154998	\N	\N	\N	\N	t	\N
2c7dbe2b-68bc-4e3c-bc00-53f7a24cfbc4	GỘI KARASTASE CẤP ẨM 1000ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	3200000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474637154936	\N	\N	\N	\N	t	\N
e9e8457a-b5aa-44bc-8e11-b020564f2f99	MÁY BẤM PHỒNG Ô VUÔNG	MÁY KẸP	\N	Cái	\N	t	1268000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP710563	\N	\N	\N	\N	t	\N
20aed028-8e96-4f27-938f-5d32481edbce	GEL UỐN SINKO STYLING 300ML	A HẢI	\N	Chai	\N	t	450000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 9356050000066	300	ml	\N	\N	t	\N
71d98eef-6279-4329-89bd-6180a0d964e9	KEM TẨY B-PROTECHS	A HẢI	\N	Túi	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: REMOVECOLOR	\N	\N	\N	\N	t	\N
6c379020-95a6-4b37-b203-6c0c0074c0b3	MÁY DUỖI TITANIUM  CERA MAGIC MIRROR	MÁY KẸP	\N	Cái	\N	t	1680000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP711358	\N	\N	\N	\N	t	\N
673b74eb-b6c3-4268-84cb-0cc14854e91d	MÀU NHUỘM TOPCHIC 7K  -250ml - N	KỸ THUẬT GOLDWEL	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: SP712690	250	ml	\N	\N	t	\N
c7f0dd68-0e87-44a0-b1ed-3da650cf9629	MÁY UỐN TÓC CHARMVIT TITANIUM	MÁY KẸP	\N	Cái	\N	t	1680000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP713078	\N	\N	\N	\N	t	\N
eb7f42e6-a19e-438f-9803-c1d1808c1110	DẦU XẢ KS COLOR 200ML	CHĂM SÓC GOLDWELL	\N	Chai	\N	t	680000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609850496	200	ml	\N	\N	t	\N
c69bce36-2186-472e-9591-094edddec791	DẦU GỘI KS COLOR 750ML	CHĂM SÓC GOLDWELL	\N	Chai	\N	t	1450000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609850137	750	ml	\N	\N	t	\N
1b94550d-76b4-4f30-a112-69c68eba5083	PHỦ BÓNG LM055	PHỦ BÓNG HQ	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: LM055	\N	\N	\N	\N	t	\N
5db848d0-cdf0-4766-a0a9-90a73ac0f3a1	PHỦ BÓNG LM074	PHỦ BÓNG HQ	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: LM074	\N	\N	\N	\N	t	\N
d93db714-26f0-4440-a3a1-ef792e0d29de	DẦU XẢ AVEDA NUTRI PLENISH LIGHT 250ML	CHĂM SÓC AVEDA	\N	Tuýp	\N	t	1225000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084014370	250	ml	\N	\N	t	\N
0245ccea-9405-4328-9d7b-211f6e612138	MÀU NHUỘM TOPCHIC 3VV 60ML	KỸ THUẬT GOLDWEL	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609000983	60	ml	\N	\N	t	\N
a7552ba9-18bb-47c5-823b-834e69c58402	JOICO KEM NHUỘM 9N LIGHT BLONDE	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721708	\N	\N	\N	\N	t	\N
b290e140-3848-4f14-97e0-20ae809fac05	JOICO KEM NHUỘM 8N MEDIUM BLONDE	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721709	\N	\N	\N	\N	t	\N
f8154207-8b6c-4cde-a7a1-30c1dfe6b0f3	JOICO KEM NHUỘM 7N DARK BLONDE	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721710	74	ml	\N	\N	t	\N
a75eef40-0e6e-492f-8ad5-5735a9055e4e	JOICO KEM NHUỘM 6N LIGHT BROWN	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721711	\N	\N	\N	\N	t	\N
6ac1315d-a5c8-409f-b9b2-86e64b09c4c4	JOICO KEM NHUỘM 5N MEDIUM BOROWN	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721712	\N	\N	\N	\N	t	\N
2e3b54a7-9d97-4c1a-9cf8-92cb0ec11426	JOICO KEM NHUỘM 4N DARK BROWN	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721713	\N	\N	\N	\N	t	\N
19d2ff1c-ad53-4192-bcc6-c78518604b04	JOICO KEM NHUỘM 1N BLACK	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721714	\N	\N	\N	\N	t	\N
f7e47304-df13-4473-b84f-9eb70834f86e	JOICO KEM NHUỘM  9A LIGHT ASH BLONDE	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721716	\N	\N	\N	\N	t	\N
304f61f3-4841-4d90-8e9b-8cdda0e430ef	JOICO KEM NHUỘM 8A MEDIUM ASH BLONDE	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721718	\N	\N	\N	\N	t	\N
e78bbe20-ac38-4341-9b22-a5c5d3ef525c	JOICO KEM NHUỘM 7A DARK ASH BLONDE	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721719	74	ml	\N	\N	t	\N
b7c960f5-1d58-438c-9832-e79c32dc2b81	JOICO KEM NHUỘM 6A LIGHT ASH BROWN	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721720	\N	\N	\N	\N	t	\N
0784475e-c493-4356-a70e-25f19af6ab1e	JOICO KEM NHUỘM 5A MEDIUM ASH BROWN	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721722	\N	\N	\N	\N	t	\N
77f4372a-3326-4268-a693-ad71042eab9f	JOICO KEM NHUỘM 8G MEDIUM GOLDEN BLONDE	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721728	\N	\N	\N	\N	t	\N
4d0e1c28-5a79-4772-a2b0-36e39232b489	JOICO KEM NHUỘM 7G DARK GOLDEN BLONDE	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721729	74	ml	\N	\N	t	\N
5d66d603-a46c-41e1-a198-7f92d96cce80	JOICO KEM NHUỘM 6G LIGHT GOLDEN BROWN	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721733	74	ml	\N	\N	t	\N
c8878622-41af-4476-b718-6984e6423ae5	JOICO KEM NHUỘM 5G MEDIUM GOLDEN BROWN	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721736	\N	\N	\N	\N	t	\N
5c896381-c4d7-4221-8d53-a1791feca868	JOICO KEM NHUỘM 8RG MEDIUM RED GOLD	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721737	\N	\N	\N	\N	t	\N
9199f77a-8b14-4ea8-91e4-68b9496c7413	JOICO KEM NHUỘM 6RC RED COPPER	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721738	74	ml	\N	\N	t	\N
a1eec0f7-1610-474c-843f-d94fb2fcf3e7	JOICO KEM  NHUỘM 6RR RUBY  RED	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721741	\N	\N	\N	\N	t	\N
e4014564-1d4e-4d22-a87b-bce167af866a	JOICO KEM NHUỘM 5RR RED GARNET	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721742	\N	\N	\N	\N	t	\N
907d9c32-1c79-473b-bfa1-ec8d6a21ace3	JOICO KEM NHUỘM 5RM RED MAHOGANY	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721743	\N	\N	\N	\N	t	\N
a8f72a3f-580c-4655-b2d5-0b116114d06b	JOICO KEM NHUỘM 4RV RED CLARET	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721746	\N	\N	\N	\N	t	\N
bf12c227-e635-49ff-aca6-c9d2ee4fd410	JOICO KEM NHUỘM 6FR CRIMSON RED	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721747	\N	\N	\N	\N	t	\N
131bf1c0-31e5-43a5-94af-18fd035eb569	JOICO KEM NHUỘM 4FV WILD ORCHIR	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721749	\N	\N	\N	\N	t	\N
308bf20c-5bfe-4bf2-9617-7335dfb1ea03	VERO K-PAK COLOR COLOR XTRA RED 7XR	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721751	\N	\N	\N	\N	t	\N
2f06998c-407d-4d33-8284-674dd00d714c	VERO K-PAK COLOR COLOR 6B LIGHT BEIGE BROWN	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721753	\N	\N	\N	\N	t	\N
e8ae21b5-1327-4cb3-bdd1-153c6bc4e40d	JOICO KEM NHUỘM 5B MEDIUM BEIGE BROWN / 2822142	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721755	\N	\N	\N	\N	t	\N
c7b85a31-97cc-4fd7-8ee8-9b53fb505bcd	VERO K-PAK COLOR  HLN LIFT NATURAL BLONDE	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721757	\N	\N	\N	\N	t	\N
9dd675a0-c803-4ec8-9a7b-c276f38211cb	VERO K-PAK COLOR  ULTRA HIGH LIFT NATURAL	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721759	\N	\N	\N	\N	t	\N
c8f71d26-4b77-4cc9-bf0a-81e6b63fc335	VERO K-PAK COLOR  TBB BEIGE BLONDE	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721762	\N	\N	\N	\N	t	\N
5650cc38-7120-40f2-9cb0-c7731bdb8359	VERO K-PAK COLOR INB ROYAL BLUE INTENSIFIER	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721764	\N	\N	\N	\N	t	\N
f5092b70-bc1a-4d42-be60-9148037587f7	JOICO KEM NHUỘM INRR EXTRA RED INTENSIFIER	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721787	\N	\N	\N	\N	t	\N
bbd701a4-dfdc-4761-bcb8-c81a9fb092cb	JOICO KEM NHUỘM CCV GLOBAL	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721788	\N	\N	\N	\N	t	\N
f3a7e848-21fe-458e-89d5-eace182a2461	JOICO KEM NHUỘM 6NA+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721789	\N	\N	\N	\N	t	\N
2e1101a9-0aa8-455d-8a90-dc4fa8d3486c	JOICO KEM NHUỘM 7NPA+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721790	\N	\N	\N	\N	t	\N
7b5b5f2c-2974-4232-a96b-d9e090cbd37f	JOICO KEM NHUỘM 6NPA+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721791	\N	\N	\N	\N	t	\N
b0c6b8e1-f0a0-43dc-bddc-eb049cc65d61	JOICO KEM NHUỘM 5NPA+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721792	\N	\N	\N	\N	t	\N
b3fa7a4a-1d01-4f5e-b758-740ff43dc7bc	JOICO KEM NHUỘM 7NA+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721793	\N	\N	\N	\N	t	\N
f5795de7-c6d5-40db-be9e-fbcfb26759f7	JOICO KEM NHUỘM 4NN+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721794	\N	\N	\N	\N	t	\N
26c2aa20-b48b-458a-ae7b-b487dd1070e0	JOICO KEM NHUỘM 5NN+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721795	\N	\N	\N	\N	t	\N
1870b200-f2f5-4de2-b367-38ef1c4319ea	JOICO KEM NHUỘM 6NN+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721797	\N	\N	\N	\N	t	\N
f509d7d9-aff6-409a-8853-ba00f6b7225a	JOICO KEM NHUỘM 7NN+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721798	\N	\N	\N	\N	t	\N
ec31fbde-78f4-45fc-8d50-8f6f551ddf33	JOICO KEM NHUỘM 8NN+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721799	\N	\N	\N	\N	t	\N
21f072d6-0e37-45de-87da-e06b3e128ad3	JOICO KEM NHUỘM 9NN+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721800	\N	\N	\N	\N	t	\N
bd8e24ad-e0cb-4d69-b9f8-66ed1bad058a	JOICO KEM NHUỘM 10NN+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721801	\N	\N	\N	\N	t	\N
0a4c75c7-d1e8-4ad0-aad9-4a85c3c54ce0	JOICO KEM NHUỘM 9NG+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721802	\N	\N	\N	\N	t	\N
4788b46e-e3d9-4090-86b9-5462a5eb79ce	JOICO KEM NHUỘM 8NG+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721803	\N	\N	\N	\N	t	\N
abdcf0c3-482e-4062-a7ac-12763b0d2bfe	JOICO KEM NHUỘM 7NG+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721804	\N	\N	\N	\N	t	\N
cfad3aff-d9c1-4ee0-99b3-484fdcd3649b	JOICO KEM NHUỘM 6NG+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721805	\N	\N	\N	\N	t	\N
502b07d0-a455-4ea1-9241-d8770f513c34	JOICO KEM NHUỘM 5NG+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721806	\N	\N	\N	\N	t	\N
6f32e26f-d93a-4b08-906a-aa3f3fc6875d	JOICO KEM NHUỘM 4NG+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721807	\N	\N	\N	\N	t	\N
47466f6b-f3ff-40bc-871c-9fabd209d968	JOICO KEM NHUỘM 8GC+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721808	\N	\N	\N	\N	t	\N
0693b38b-6a86-428a-abb7-44ef5ac5d8a7	JOICO KEM NHUỘM 7CG+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721809	\N	\N	\N	\N	t	\N
ea9a5e11-88c2-4442-ae67-54b2e9eff907	JOICO KEM NHUỘM 6CG+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721810	\N	\N	\N	\N	t	\N
cdd7157d-aa0d-4876-a60e-d1c841792823	JOICO KEM NHUỘM 6NR+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721811	\N	\N	\N	\N	t	\N
fe83b271-048d-4999-8d61-c563fa1bfd70	THUỐC NHUỘM AVEDA 5N	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084025307	80	ml	\N	\N	t	\N
9af88371-391d-4c85-a8b0-4baccbbe4687	THUỐC NHUỘM AVEDA 8N	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084025338	80	ml	\N	\N	t	\N
8307103e-f9e3-4e5c-b206-604eaa2a0ef0	JOICO KEM NHUỘM 8MB+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721813	\N	\N	\N	\N	t	\N
29de1f1d-0371-4fc5-b28e-6218cecdc7b3	JOICO KEM NHUỘM 8NB+	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP721814	74	ml	\N	\N	t	\N
45011e4c-6503-45eb-b0b3-4aa2c454375a	JOICO KEM NHUỘM 7NB+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721815	\N	\N	\N	\N	t	\N
af98d37e-408a-450f-9efe-2ef7b99370f0	JOICO KEM NHUỘM 6NB+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721816	\N	\N	\N	\N	t	\N
7d47409b-8d5f-455d-ac8d-67a3f249c257	JOICO KEM NHUỘM 5NB+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721817	\N	\N	\N	\N	t	\N
61bfe2d7-e78d-4a07-af1f-ad00277cf24b	JOICO KEM NHUỘM 10NB+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721819	\N	\N	\N	\N	t	\N
8e61f913-f7bd-4ba6-b637-5ad928a0691c	JOICO KEM NHUỘM 6MB+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721820	\N	\N	\N	\N	t	\N
8698a83b-c659-4121-bd20-5a9f5b327800	JOICO KEM NHUỘM  5MB+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721821	\N	\N	\N	\N	t	\N
9552534f-288a-410c-8bc5-52b919fc388f	JOICO KEM NHUỘM  10A	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721826	\N	\N	\N	\N	t	\N
8221ec8f-b283-473a-a1a9-5f88e1a28d38	JOICO KEM NHUỘM XTRA RED 5XR	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721832	\N	\N	\N	\N	t	\N
7f64af75-61db-4379-baee-3ba8f4873d15	JOICO KEM NHUỘM  9B LIGHT BEIGE BLONDE	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721833	\N	\N	\N	\N	t	\N
e8cbafa8-ef57-436e-b29f-32af1638d4fe	JOICO KEM NHUỘM  TSB SILVER	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721834	\N	\N	\N	\N	t	\N
ea47edb8-6590-40e7-9bca-2f77b5a56809	JOICO KEM NHUỘM  INS SILVER	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721835	\N	\N	\N	\N	t	\N
826c8f84-fd57-460a-bd01-69a52d45592d	BỘT TẨY THAN HOẠT TÍNH MAXIMA 500G	Cty TNG	\N	Túi	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8030778700569	\N	\N	\N	\N	t	\N
135621e9-d014-44d3-9316-c1ad504b31bf	MẶT NẠ KERASTASE MASQUINTENSE DÀNH CHO TÓC KHÔ 200ML	CHĂM SÓC KERASTASE	\N	Hũ	\N	t	1365000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474637154967	200	ml	\N	\N	t	\N
1260f96f-a278-4bf0-82fd-50f11d5eab93	MẶT NẠ KERASTASE GENESIS NGĂN RỤNG TÓC 200ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1365000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636857937	200	ml	\N	\N	t	\N
a012435d-861e-4df9-b7d0-c7fa90d877c0	MẶT NẠ KERASTASE MASQUINTENSE DÀNH CHO TÓC KHÔ 500ML	CHĂM SÓC KERASTASE	\N	Hũ	\N	t	3100000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474637154974	500	ml	\N	\N	t	\N
e1e8731f-2c20-4e42-a210-db590ecc2b03	TÍNH CHẤT DƯỠNG TÓC LOREAL 90ML	CHĂM SÓC LOREAL	\N	Chai	\N	t	1790000	0	\N	\N	\N	\N	Thương hiệu: L'Oréal Paris\nSKU: 3474637106348	90	ml	\N	\N	t	\N
1e5dbdad-15ab-4071-9e94-721dc45e2bec	DUNG DỊCH amino axit PHỤC HỒI TÓC 300ml	CHĂM SÓC KERATIN	\N	Chai	\N	t	539000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP726067	300	ml	\N	\N	t	\N
524bd730-0126-40dd-8f5b-b660790a4426	DẦU XẢ DAVINES MINU 1000ML	CHĂM SÓC TÓC DAVINES	\N	Chai	\N	t	1522000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 8004608242604	1000	ml	\N	\N	t	\N
0289ff17-c714-4b26-957f-2f3ff4263385	AVEDA OXY 30VOL 887ML	KỸ THUẬT AVEDA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084868041	887	ml	\N	\N	t	\N
5fc173c4-9fe7-480f-8297-39332f94279c	AVEDA OXY 20VOL 887ML	KỸ THUẬT AVEDA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084868034	887	ml	\N	\N	t	\N
db8a818b-6f16-468c-8b20-730d85741909	THUỐC NHUỘM AVEDA IB 80ML	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084031773	\N	\N	\N	\N	t	\N
04bd3f33-c515-4f53-9917-d6a7ba85e9ae	THUỐC NHUỘM AVEDA 9N	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084025345	80	ml	\N	\N	t	\N
384ac885-be5c-458e-9942-c18eaa1dcb38	THUỐC NHUỘM AVEDA 7NN	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084025420	\N	\N	\N	\N	t	\N
2a6a9263-5330-4e74-b4cd-a50387e793bb	THUỐC NHUỘM AVEDA 10N	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084025352	80	ml	\N	\N	t	\N
21aa6f21-86c7-44b7-bc62-fec16c84918d	THUỐC NHUỘM AVEDA 5NN 80ML	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084025307	80	ml	\N	\N	t	\N
5c6414d0-483f-44e1-b795-f43e8aa50046	THUỐC NHUỘM AVEDA 9NN	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084025444	80	ml	\N	\N	t	\N
cac7d119-2d41-4d8c-ba8f-914d597bfe81	THUỐC NHUỘM AVEDA 6NC	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084025314	80	ml	\N	\N	t	\N
46b6a5d9-8e16-42d4-93d2-41f9fe6c21a4	THUỐC NHUỘM AVEDA 8NC 80ML	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084025338	80	ml	\N	\N	t	\N
dd1fb376-a936-4352-8d88-896a341873a0	THUỐC NHUỘM AVEDA 9NC	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084029589	80	ml	\N	\N	t	\N
bd896141-5d2c-4575-99c0-929671247388	THUỐC NHUỘM AVEDA 5NC	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084029541	80	ml	\N	\N	t	\N
ecd797f4-0650-4adb-a42d-d86bc19e450f	THUỐC NHUỘM AVEDA 8NN	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084025437	80	ml	\N	\N	t	\N
53405672-40bf-4757-bb28-e221755f7845	THUỐC NHUỘM AVEDA 3N	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084025284	80	ml	\N	\N	t	\N
199ac5ab-593b-4ffa-ad08-bfeb66e87790	THUỐC NHUỘM AVEDA 7NC	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084025321	80	ml	\N	\N	t	\N
86b26fa3-5dd9-474d-b044-e5f4a3ba346a	THUỐC NHUỘM AVEDA 3NC	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084029527	80	ml	\N	\N	t	\N
43a585d7-9de5-4283-9304-ad4bc43c0c8f	THUỐC NHUỘM AVEDA 4NC	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084025291	80	ml	\N	\N	t	\N
d209bb28-33c5-43ac-baca-a7eeb282174c	THUỐC NHUỘM AVEDA 4N	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084025291	80	ml	\N	\N	t	\N
0542b210-4cd0-42d7-8517-83de3d09ec61	THUỐC NHUỘM AVEDA 6N	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084025314	80	ml	\N	\N	t	\N
2b59354e-3289-421b-be69-df460f9f6c64	THUỐC NHUỘM AVEDA 7N	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084025321	80	ml	\N	\N	t	\N
29f7d1cf-7fc1-452f-8cb2-95764e20cca9	DẦU XẢ K-PAK DAILY CD 250ML / 2574887	CHĂM SÓC TÓC JOICO	\N	Tuýp	\N	t	520000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469517157	250	ml	\N	\N	t	\N
53df7dce-d93a-4f8a-a3f7-71d592fc0659	DẦU GỘI PHỤC HỒI HƯ TỔN & GIỮ MÀU TÓC NHUỘM 300ML / 2571123	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	520000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469516525	300	ml	\N	\N	t	\N
4282f2a6-adc4-4510-944d-113d62e4766f	DẦU XẢ PHỤC HỒI & GIỮ MÀU TÓC NHUỘM 250ML	CHĂM SÓC TÓC JOICO	\N	Tuýp	\N	t	520000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469516471	250	ml	\N	\N	t	\N
22b9bc0a-6eb9-4263-8ae8-6b97491a2843	DẦU GỘI BỔ SUNG SẮC TỐ XANH 300ML / 2620520	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	620000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469519229	300	ml	\N	\N	t	\N
c7570bb4-8883-4467-8e05-3e936fd82bae	DẦU XẢ BỔ SUNG ĐỘ ẨM HYDRASPLASH 250ML / 2561385	CHĂM SÓC TÓC JOICO	\N	Tuýp	\N	t	520000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469513418	250	ml	\N	\N	t	\N
e77678b0-4611-4988-840c-a346e6da5300	DẦU GÔI BỔ SUNG SẮC TỐ TÍM BALANGE PURPLE 300ML / 2620517	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	620000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469519199	300	ml	\N	\N	t	\N
3aeaf6da-a9d3-4b04-921b-f274e595a088	DẦU GỘI DEFY DAMAGE 300ML / 2938339	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	620000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469509237	300	ml	\N	\N	t	\N
55614624-b4d3-4be1-a565-8b9e18da3d56	DẦU XẢ DEFY DAMAGE 250ML / 2894857	CHĂM SÓC TÓC JOICO	\N	Tuýp	\N	t	620000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469509169	250	ml	\N	\N	t	\N
8b305631-386a-4f46-9dc3-7320fb2058fa	DẦU GỘI CẤP ẨM HYDRASPLASH 300ML / 2764127	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	520000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469513449	300	ml	\N	\N	t	\N
5e3c3733-69ea-4e43-bb9c-5287fd19ef5b	DẦU GỘI K-PAK DAILY CD 250ML	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	520000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469517447	300	ml	\N	\N	t	\N
2638d326-64e5-48cf-98af-090d666b3d04	HẤP DẦU JOICO K-PAK HYDRATOR 250ML / 2895756	CHĂM SÓC TÓC JOICO	\N	Tuýp	\N	t	730000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469517355	250	ml	\N	\N	t	\N
4afc4711-6392-48b3-9b47-3277e7284faa	PHỤC HỒI BIỂU BÌ TÓC A+ 450ML	KỸ THUẬT A+	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 4895177816624	450	ml	\N	\N	t	\N
075cecfe-8c90-4d17-a36e-634d44a1ef3b	AVEDA OXY 10vol 887ML	KỸ THUẬT AVEDA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084868027	887	ml	\N	\N	t	\N
de802ad5-1592-4a11-8d1b-8973983b60e3	AVEDA OXY 40vol 887ML	KỸ THUẬT AVEDA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: SP727657	887	ml	\N	\N	t	\N
b5a8f61b-1a20-4666-b8b4-1e8d9506262e	THUỐC NHUỘM AVEDA 2NN	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084025376	80	ml	\N	\N	t	\N
3daf090e-396b-44a8-81e4-2d304182fd8c	THUỐC NHUỘM AVEDA 4NN	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084025390	80	ml	\N	\N	t	\N
fe201b57-b3db-4dcc-a55f-1dd89db22a77	THUỐC NHUỘM AVEDA 6NN	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084025413	80	ml	\N	\N	t	\N
7ab78c99-69e1-4743-ba56-f09edf8ba8ae	THUỐC NHUỘM AVEDA 10NC	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: SP727675	80	ml	\N	\N	t	\N
d51daaf8-90e5-4424-8107-f58f3eef86f5	JOICO THUỐC NHUỘM HLA	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP728196	74	ml	\N	\N	t	\N
88697959-cafb-4e9a-9c87-0a80569dafe9	JOICO THUỐC NHUỘM 7RC	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP728198	\N	\N	\N	\N	t	\N
08a31c8d-5328-4d7c-a152-6b55678315e7	JOICO THUỐC NHUỘM UHLN	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP728199	\N	\N	\N	\N	t	\N
0ae160cc-d1a5-48d0-9096-b92dd9962ee2	JC THUỐC NHUỘM 8NA lumi10	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP728712	\N	\N	\N	\N	t	\N
1d53f18a-6837-4753-8f09-a8b2974c69b3	JC THUỐC NHUỘM 7NV lumi10	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP728713	\N	\N	\N	\N	t	\N
46a33b21-351b-4e88-9ba5-62399f3f0c0c	JC THUỐC NHUỘM 8NG lumi10	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP728715	\N	\N	\N	\N	t	\N
2bbded14-3e68-4c2a-acb4-bd95f2ec4e4c	JC THUỐC NHUỘM 5NWB lumi10	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP728716	\N	\N	\N	\N	t	\N
6e3500f3-5852-452a-a2e7-c70c4582bd5b	JC THUỐC NHUỘM 7NWB lumi10	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP728717	\N	\N	\N	\N	t	\N
d6f1fcf6-6ed6-4116-af6b-46aac3bf6d3d	JC THUỐC NHUỘM 7NA lumi10	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP729362	\N	\N	\N	\N	t	\N
6d23e3e1-9831-4e75-96fd-19987200aa21	JC THUỐC NHUỘM 9NV lumi10	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP729364	\N	\N	\N	\N	t	\N
becb453e-f270-4a56-a602-0eab1cd6e983	JC THUỐC NHUỘM 5NV lumi10	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP729368	\N	\N	\N	\N	t	\N
99a002da-d53f-48e9-8fb7-7b4bd03337d7	JC THUỐC NHUỘM 10N lumi 10	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP729370	\N	\N	\N	\N	t	\N
adba35f9-1997-42d1-ac57-16d16bdf2023	JC THUỐC NHUỘM 6NG lumi10	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP729375	\N	\N	\N	\N	t	\N
edf4ca0a-ecc2-4ef7-aef3-e47e21019634	JC THUỐC NHUỘM 6NA lumi 10	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP729377	\N	\N	\N	\N	t	\N
addf982d-ee1d-442c-96b6-a6da1fd2289b	JC THUỐC NHUỘM 8NWB	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP729378	\N	\N	\N	\N	t	\N
fb242be9-a85f-4a8d-beac-4fd978f65bfd	JC THUỐC NHUỘM 6NWB lumi10	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP729379	\N	\N	\N	\N	t	\N
54ab0321-0296-454f-83f9-31f7694b6f74	PROTEIN	A HẢI	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP732028	\N	\N	\N	\N	t	\N
a59e1372-b1ca-4742-a7c3-7740d718267e	DẦU GỘI CLEAR 1,4KG	KHÁC	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP733803	\N	\N	\N	\N	t	\N
464cf89d-193e-4255-af14-6f112476e2c2	MẶT NẠ TAY BANDI	SP NAIL	\N	Cái	\N	t	360000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8801342530469	\N	\N	\N	\N	t	\N
37bd9e5a-58e8-4b63-a2cc-8a757c713ef2	MẶT NẠ CHÂN BANDI	SP NAIL	\N	Cái	\N	t	380000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8801342533971	\N	\N	\N	\N	t	\N
a6280022-a940-4e4a-80af-4cf737ecd312	Keratherapy Brazilian Renewal Smoothing Cream 6350	CHĂM SÓC KERATIN	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 852979006350	1000	ml	\N	\N	t	\N
4db78d26-7763-4226-a606-58dc1d05f330	DẦU GỘI KRT CHO TÓC KHÔ NUTRITIVE 250ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1150000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474637154943	250	ml	\N	\N	t	\N
c6e00631-d713-483d-bda5-5b2ef59afdc9	KEM NHUỘM RIGHT 6.41	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182690398	100	ml	\N	\N	t	\N
f324ee54-4c06-4821-bb1d-e87e6e53171d	SP MẶT NẠ CZ NÂNG CƠ	[COMFORT ZONE]	\N	Cái	\N	t	488000	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608517085	1	ml	\N	\N	t	\N
6c11b133-4dfa-448f-bccf-73604ae93742	SP MẶT NẠ CZ NHẠY CẢM de stress mack	[COMFORT ZONE]	\N	Cái	\N	t	488000	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608517092	1	ml	\N	\N	t	\N
939241bc-5eb9-46e6-8cff-f0b5bea69e51	SP MẶT NẠ CZ CẤP ẨM Water Source Mack	[COMFORT ZONE]	\N	Cái	\N	t	488000	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608517078	1	ml	\N	\N	t	\N
60c1cad5-543d-477f-84de-2a7a2ae78018	BƯỚC 4 K-PAK PHỤC HỒI DƯỠNG 1000ML / J16420	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469517386	1000	ml	\N	\N	t	\N
2fa9c49e-fb44-4837-aff3-c3750ba9073e	BƯỚC 3 K-PAK PHỤC HỒI DƯỠNG 1000ML / J16418	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469517256	1000	ml	\N	\N	t	\N
afe51542-89a6-4f41-a870-e52c7bfdede7	BƯỚC 2 K-PAK PHỤC HỒI DƯỠNG 1000ML	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469517140	1000	ml	\N	\N	t	\N
7692865e-6b6a-4f40-ab4f-14bdebc15de0	DẦU GỘI K-PAK CLARIFYING loại bỏ tạp chất  300ML	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	460000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469517126	300	ml	\N	\N	t	\N
3dca3fa0-7969-451f-9f5c-f37a6d51c70a	THUỐC NHUỘM 5N LUMI 10	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP738977	\N	\N	\N	\N	t	\N
03b5702e-7447-4f25-8be4-7e745c1d9949	KEM THUỘM RG 8.32	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182690763	\N	\N	\N	\N	t	\N
be57b587-0868-4608-bf18-589cf3353b51	KEM NHUỘM RG 6.32	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP739330	\N	\N	\N	\N	t	\N
9d8a68d4-f796-4983-b2d6-e8f893b7b7d4	BANDI TẨY TẾ BÀO CHẾT CHÂN 450ML	SP NAIL	\N	Hũ	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8809422865554	450	ml	\N	\N	t	\N
8a1756cb-96cd-4c83-9624-b7f3cecffe67	KEO XỊT TÓC JOICO BODY SHAKE 250ML	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	590000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469523035	250	ml	\N	\N	t	\N
5b681abf-8e95-4a4b-acbc-fe6fbbfe7123	KEO XỊT TĂNG PHỒNG JOICO FLIP TURN 300ML / 2548374	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	590000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469523288	300	ml	\N	\N	t	\N
a96eea4e-7730-4bc5-8cba-23f85871fd25	DẦU DƯỠNG DA THƯ GIÃN TRANQUILITY BLEND 230ML	[COMFORT ZONE]	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608513979	230	ml	\N	\N	t	\N
ddcc724b-a7ba-4b44-887c-09bb22951792	NƯỚC TẨY TRANG ESSENTIAL BIPHASIC 500ML	[COMFORT ZONE]	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608527794	500	ml	\N	\N	t	\N
b7a6c436-1da7-4ba5-b1eb-08598ca95d7a	SỮA RỬA MẶT DỊU NHẸ ESSENTIAL MILK 500ML	[COMFORT ZONE]	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608506249	500	ml	\N	\N	t	\N
340c6326-319b-422e-9544-b7b1b9e156db	DUNG DỊCH DƯỠNG DA ESSENTIAL TONER 500ML	[COMFORT ZONE]	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608506256	500	ml	\N	\N	t	\N
86dcbfbb-d1c4-4823-98cc-c6e3b719f4eb	KEM TẨY TẾ BÀO CHẾT ESSENTIAL SCRUB 250ML	[COMFORT ZONE]	\N	Tuýp	\N	t	1166000	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608502883	250	ml	\N	\N	t	\N
f4bf28e0-78c3-47b4-82a1-0e9942309ee7	MẶT NẠ TẨY TẾ BÀO CHẾT ESSENTIAL PEELING 250ML	[COMFORT ZONE]	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608504795	250	ml	\N	\N	t	\N
83343961-9084-4d76-908b-9b8e58f025aa	DUNG DỊCH LÀM SẠCH DA ACID PREPARATOR 280ML	[COMFORT ZONE]	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608514763	280	ml	\N	\N	t	\N
a9d3250c-15d3-4797-aea5-5878f480be53	DUNG DỊCH TẨY TẾ BÀO CHẾT PEEL BOOSTER 280ML	[COMFORT ZONE]	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608512998	280	ml	\N	\N	t	\N
00ccbbf4-51ad-4e85-bfb5-ed0dc237a331	DUNG DỊCH TẨY TẾ BÀO DA CHẾT NEUTRALIZER 280ML	[COMFORT ZONE]	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608514770	280	ml	\N	\N	t	\N
b5590c5b-2726-4f21-80ab-8383998acfb1	MẶT NẠ DƯỠNG ẨM HYDRA MASK 250ML	[COMFORT ZONE]	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608515517	250	ml	\N	\N	t	\N
b9acd384-7fa9-44e3-a333-53f2764859e3	KEM DƯỠNG ẨM VÙNG DA MẮT EYE CREAM 15ML	[COMFORT ZONE]	\N	Tuýp	\N	t	1276000	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608505853	15	ml	\N	\N	t	\N
f1ae6286-72d9-434b-ae97-7d62a1420ac2	TINH CHẤT TĂNG CƯỜI ĐỘ ẨM HYDRAMEMORY SERUM 150ML	[COMFORT ZONE]	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: SP740977	150	ml	\N	\N	t	\N
4ec2ba2d-5c70-4715-b325-7695fa48d883	KEM DƯỠNG ẨM DA RICH SORBET CREAM 250ML	[COMFORT ZONE]	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608515449	250	ml	\N	\N	t	\N
a6cdd15d-2f05-41b5-9b49-d3a74fed7a78	MẶT NẠ PHỤC HỒI RECOVER TOUCH MASK 250ML	[COMFORT ZONE]	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608506409	250	ml	\N	\N	t	\N
55c5b835-7971-4d95-b9e1-470b76bead61	KEM MASSAGE RECOVER TOUCH 400ML	[COMFORT ZONE]	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608506386	400	ml	\N	\N	t	\N
ef3b8eb4-6509-4373-86cf-93cd53a0fa4d	KEM RỬA MẶT REMEDY CREAM TO OIL 400ML	[COMFORT ZONE]	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608506331	400	ml	\N	\N	t	\N
2fd2911b-5dce-4d8d-93a6-998e1bfbea3c	DUNG DỊCH DƯỠNG DA REMEDY SERUM 150ML	[COMFORT ZONE]	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608506379	\N	\N	\N	\N	t	\N
38a149de-b615-472c-9240-1a182e64ae19	GEL MẶT NẠ DƯỠNG DA REMEDY OFF MASK 10x40G	[COMFORT ZONE]	\N	Túi	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608506362	\N	\N	\N	\N	t	\N
dfbbb08a-298c-424c-b589-1f71df30bfd4	KEM DƯỠNG ẨM DỊU NHẸ REMEDY CREAM 250ML	[COMFORT ZONE]	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608506355	250	ml	\N	\N	t	\N
b0e0f285-15b5-4036-820b-06cce5f0be47	NƯỚC TẨY TRANG ESSENTIAL MICELLAR WATER 200ML	[COMFORT ZONE]	\N	Chai	\N	t	902000	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608505785	200	ml	\N	\N	t	\N
147656e6-c800-471d-a46e-a54456c76404	DUNG DỊCH DƯỠNG DA ESSENTIAL TONER 200ML	[COMFORT ZONE]	\N	Chai	\N	t	836000	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608505778	200	ml	\N	\N	t	\N
bc300a81-5445-4ce1-816d-037dbf0e71cb	DUNG DỊCH DƯỠNG ẨM WATER SOURCE SERUM 30ML	[COMFORT ZONE]	\N	Chai	\N	t	2046000	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608505846	30	ml	\N	\N	t	\N
2ed761cf-d083-4a42-a514-0aa32801b606	KEM DƯỠNG ẨM RICH SOURBET CREAM 50ML	[COMFORT ZONE]	\N	Hũ	\N	t	1892000	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608505839	50	ml	\N	\N	t	\N
fad4e54f-d6bf-4095-b716-58717f8f4b14	DUNG DỊCH DƯỠNG DA HYDRA & GLOW AMPOULE 7x2ml	[COMFORT ZONE]	\N	Ống	\N	t	1342000	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608510871	2	ml	\N	\N	t	\N
50bae076-3344-471d-bdf9-453213153e96	NƯỚC DƯỠNG DA REMEDY TONER 200ML	[COMFORT ZONE]	\N	Chai	\N	t	990000	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608505884	200	ml	\N	\N	t	\N
d328e3e8-0e59-4585-89a3-ccb52ddbd86c	DẦU DƯỠNG PHỤC HỒI BAN ĐÊM RENIGHT OIL 30ML	[COMFORT ZONE]	\N	Chai	\N	t	1650000	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608505945	30	ml	\N	\N	t	\N
b6a79a81-eaeb-4f20-ad63-6bedf7ab5984	KEM RỬA MẶT CLEANSING CREAM 150ML	[COMFORT ZONE]	\N	Tuýp	\N	t	990000	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608515708	150	ml	\N	\N	t	\N
e0d8814a-79dd-411d-a8c6-f12ba3236808	GEL LÀM DỊU DA SUN SOUL ALOE 150ML	[COMFORT ZONE]	\N	Tuýp	\N	t	746000	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608515920	150	ml	\N	\N	t	\N
e0aed25f-f6d2-4149-aba8-e1746eecd85e	DUNG DỊCH DƯỠNG DA CHỐNG NHĂN SUBLIME AMPOULE 7x2ml	[COMFORT ZONE]	\N	Ống	\N	t	1892000	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 800468510864	\N	\N	\N	\N	t	\N
ddc95e92-a0a1-4e35-b29c-ba9722aae19f	DỤNG CỤ MASSA ICE ROLLER	[COMFORT ZONE]	\N	Cái	\N	t	781000	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608519034	\N	\N	\N	\N	t	\N
d41e20df-d46a-44d2-aaf2-58cdc65f864e	OXY DORADO CREAM 10 VOL 3%	KỸ THUẬT DORADO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP741350	\N	\N	\N	\N	t	\N
37abfb43-6d46-4549-aa44-2ea1f041ba62	OXY LUMISHINE 10 VOL ( 3%) 950ML	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 3%	1000	ml	\N	\N	t	\N
888f94b8-d3b5-4952-9890-9cedc4d64d5e	OXY LUMISHINE 20 VOL ( 6%) 950ML	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP742582	1000	ml	\N	\N	t	\N
eedca5b1-c3cc-4956-89cb-e11b129fe80d	DẦU XẢ TĂNG SẮC TỐ XANH COLOR BLANCE PURPLE 250ML / 2620521	CHĂM SÓC TÓC JOICO	\N	Tuýp	\N	t	620000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469519205	250	ml	\N	\N	t	\N
9028aa67-3457-4579-b186-85f715df338e	GBC UỐN TÓC DẠNG KEM YẾU ACID 400ML	KT PAIMORE	\N	Túi	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Paimore\nSKU: 4582406483312	400	ml	\N	\N	t	\N
d3e95eb6-b4fb-4c79-bc42-d087f782b8fa	MÀU NHUỘM MILBON B7-NB	Kỹ Thuật Milbon	\N	Tuýp	\N	t	384000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP745703	\N	\N	\N	\N	t	\N
39d0298d-fc75-4907-9f8a-9e39a022f8ff	OXY DORADO CREAM 20 VOL 6%	KỸ THUẬT DORADO	\N	Chai	\N	t	240000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP746009	\N	\N	\N	\N	t	\N
5269418c-6902-42c3-8b8f-ecb98f89ccc6	OXY LUMI 30VOL 9%	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP747762	1000	ml	\N	\N	t	\N
80d444a3-a514-457f-b984-3f09a4426e0c	OXY LUMI 40VOL 12%	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP747765	1000	ml	\N	\N	t	\N
1a80b089-3702-4a1d-b827-a6cfb9893bf9	DẦU XẢ NGĂN NGỪA CHỐNG HƯ TỔN DEFY DAMAGE 1000ML / 2894943	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1550000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469509145	1000	ml	\N	\N	t	\N
5cab90e1-11ab-4005-87fd-280b8c13b5f6	XỊT TẠO KIỂU STYLEMUSE SHINE SPRAY 300ML	CHĂM SÓC TÓC DAVINES	\N	Chai	\N	t	320000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8809771823588	\N	\N	\N	\N	t	\N
d7405b40-c8f9-4fae-9403-825b8bd66ce9	KEM NHUỘM RG VIOLA 100ML	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP753613	\N	\N	\N	\N	t	\N
888c9f65-4ef5-4754-8df1-5a3fcef7da5a	OXY DORADO 3.5 VOL 1%	KỸ THUẬT DORADO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP754413	1000	ml	\N	\N	t	\N
c1ea28c9-c3f1-4a30-b9c6-6d1cf60827d6	JOICO KEM NHUỘM HLB	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP754423	\N	\N	\N	\N	t	\N
afd1d6ac-bfd8-4944-84e7-716621824647	DẦU GỘI MR SMOOTHING 2000ML	CHĂM SÓC TÓC Moroccanoil	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Moroccanoil\nSKU: 7290116973432	2000	ml	\N	\N	t	\N
c71591bf-6b35-4688-8359-04aa268a36bb	DẦU XẢ MR SMOOTHING 2000ML	CHĂM SÓC TÓC Moroccanoil	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Moroccanoil\nSKU: 7290116973449	2000	ml	\N	\N	t	\N
846a243f-6c1d-40f7-91b5-4ecbc5b61ff3	DẦU XẢ KS COLOR 750ML	CHĂM SÓC GOLDWELL	\N	Chai	\N	t	1450000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609850540	750	ml	\N	\N	t	\N
135e2781-59c9-4be8-9691-c29172d7b7e6	OXY DORADO 30VOL 9%	KỸ THUẬT DORADO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP757427	1000	ml	\N	\N	t	\N
d8dd308e-8510-4ad9-84fe-d5fab2ba0762	Naraxis tinh chất Essenza Aroma Therapy Soothing Ampoule 7ml*8	CHĂM SÓC NARAXIS	\N	Ống	\N	t	1725000	0	\N	\N	\N	\N	Thương hiệu: NARS\nSKU: SP757613	7	ml	\N	\N	t	\N
dac223c3-6fb0-4d4a-ac35-865a60503fa1	THUỐC NHUỘM B7-RB	Kỹ Thuật Milbon	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP762265	\N	\N	\N	\N	t	\N
9bbe1746-881b-4857-b9e0-29ec01dd1be3	THUỐC NHUỘM B8-RB	Kỹ Thuật Milbon	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP762266	\N	\N	\N	\N	t	\N
d850b661-ab65-4bf8-9c44-417cbfecae7d	THUỐC NHUỘM B9-RB	Kỹ Thuật Milbon	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP762268	\N	\N	\N	\N	t	\N
2502851e-2397-4339-995b-05e9a6c96cfc	XỊT DƯỠNG PHỤC HỒI K-PAK 300ML	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	580000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469517393	300	ml	\N	\N	t	\N
d6195b84-9646-4ff8-b82f-77bcceeed3ea	KERATHERAPY TÍM 1000ML	CHĂM SÓC KERATIN	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 852979006862	\N	\N	\N	\N	t	\N
ed62fe46-4d28-405e-b761-fc0946faeb9b	THUỐC NHUỘM B8-CB	Kỹ Thuật Milbon	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP763668	\N	\N	\N	\N	t	\N
d4c31ba1-176d-42c8-bf28-47a79a717b4e	THUỐC NHUỘM B9-CB	Kỹ Thuật Milbon	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP763670	\N	\N	\N	\N	t	\N
12655fb6-5e57-4d0e-9673-d9f4fa6ea13e	THUỐC NHUỘM LUMISHINE 7N 74ML	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP764236	\N	\N	\N	\N	t	\N
067820b8-9ff4-4254-9d35-d0480dd6894f	MÀU NHUỘM LUMISHINE INB 74ML	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP764237	\N	\N	\N	\N	t	\N
4eca6831-f29b-4c6e-82fc-df3e4b473978	DẦU DƯỠNG TÓC MOROCCANOIL LIGHT 125ML	CHĂM SÓC TÓC Moroccanoil	\N	Chai	\N	t	1102000	0	\N	\N	\N	\N	Thương hiệu: Moroccanoil\nSKU: 7290011521998	125	ml	\N	\N	t	\N
21418faa-413d-4bd8-8be7-f06176ac383e	MÁY SẤY GLAMPALM	MÁY SẤY, KẸP GLAMPALM	\N	Cái	\N	t	3750000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: GP715	\N	\N	\N	\N	t	\N
491ffff0-6284-4dba-bba6-36f1754faac0	MÁY KẸP MASSAMASSAGE TÓC GLAMPALM	MÁY SẤY, KẸP GLAMPALM	\N	Cái	\N	t	6390000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: GP244	\N	\N	\N	\N	t	\N
3cb1317c-cdfd-42e1-b1ae-77fd8183adad	MÁY DUỖI MINI GLAMPALM	MÁY SẤY, KẸP GLAMPALM	\N	Cái	\N	t	1890000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: GP103	\N	\N	\N	\N	t	\N
2213f48c-3627-4df3-a64e-4c7566bce827	MÁY KẸP GLAMPAIM (SIZE NHỎ)	MÁY SẤY, KẸP GLAMPALM	\N	Cái	\N	t	5590000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: GP225	\N	\N	\N	\N	t	\N
a7a15689-daf6-4c78-9716-ad3a4ef32642	DẦU GỘI NGĂN NGỪA & CHỐNG HƯ TỔN DEFY 1000ML / 2643581	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1550000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469509213	1000	ml	\N	\N	t	\N
d32be25e-9fcd-4cc1-978f-411a1d47f685	TINH CHẤT TRỊ RỤNG ENERGIZING SUPERACTIVE 100ML	CHĂM SÓC TÓC DAVINES	\N	Chai	\N	t	1567000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 8004608275374	100	ml	\N	\N	t	\N
d096a0dc-306e-4b80-b86f-ad92e18b7040	VÒI AVEDA	CHĂM SÓC AVEDA	\N	Chai	\N	t	60000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: SP770418	\N	\N	\N	\N	t	\N
2295c77d-258b-407b-8aec-9fcfe69b6e36	MẶT NẠ BANDI 2IN1 FLOWER VITA ROSE HIP 120ML	SP NAIL	\N	Cái	\N	t	650000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8809847571665	\N	\N	\N	\N	t	\N
7da6806c-77e3-4ffd-b649-0aed73270dd5	DẦU GỘI JOICO K-PAK RECONSTRUCTING PHỤC HỒI TÓC HƯ TỔN 1000ML	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1050000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469517577	1000	ml	\N	\N	t	\N
00910679-2f14-4c54-856b-d37dee44836c	DẦU XẢ JOICO K-PAK RECONSTRUCTING PHỤC HỒI TÓC HƯ TỔN 1000ml / 2574888	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1250000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469517188	1000	ml	\N	\N	t	\N
9308e713-4f65-4f65-b67d-53f1b72fd797	HẤP DẦU JOICO MOISTURE CẤP ẨM 500ML	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1300000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469513999	500	ml	\N	\N	t	\N
ede20864-36fb-4cbd-a251-0d5d5f1900fc	HẤP DẦU JOICO MOISTURE CẤP ẨM 250ML	CHĂM SÓC TÓC JOICO	\N	Tuýp	\N	t	730000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469513982	250	ml	\N	\N	t	\N
e3dcbb8f-b1d5-4f24-8539-add933f52179	DƯỠNG CHẤT PROTEIN PHỤC HỒI K-PAK 300ML	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469517409	300	ml	\N	\N	t	\N
8f764057-6942-4f1b-bb53-2539bd0cc51a	HẤP DẦU K-PAK COLOR GIỮ MÀU 500ML / J155831	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1300000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469516587	500	ml	\N	\N	t	\N
eb35614e-6e09-442b-8dc1-8da596eaad1c	HẤP DẦU K-PAK COLOR GIỮ MÀU 250ML / 2620694	CHĂM SÓC TÓC JOICO	\N	Tuýp	\N	t	730000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469516624	250	ml	\N	\N	t	\N
7b302ed1-84eb-49da-ba0f-333bb89fbbd0	DẦU GỘI NOUNOU DAVINES 5000ML	CHĂM SÓC TÓC DAVINES	\N	Can	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: SP775972	5000	ml	\N	\N	t	\N
e71579c5-d23f-4f2b-8e46-a0534cf398c4	DẦU XẢ NOUNOU DAVINES 5000ML	CHĂM SÓC TÓC DAVINES	\N	Can	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: SP775977	5000	ml	\N	\N	t	\N
adadd49d-8c58-407d-82a9-d0f338e7da97	OXY DORADO 40VOL 12%	KỸ THUẬT DORADO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP777686	\N	\N	\N	\N	t	\N
082a80e4-6af5-4cb7-ab88-9f1a07d90a9a	DORADO CREAM 1C	KỸ THUẬT DORADO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684009117	\N	\N	\N	\N	t	\N
fd6c41fb-0549-4067-b60e-6e0c075f5355	MÀU NHUỘM TOPCHIC 6RR 250ML	KỸ THUẬT GOLDWEL	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: SP780323	250	ml	\N	\N	t	\N
0134d67c-842a-4118-abeb-381883bcb231	MÀU NHUỘM PAECH PIE	KỸ THUẬT DORADO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP780327	\N	\N	\N	\N	t	\N
3ebb99b7-929c-4797-a3d9-0458f7110b08	Kem chống nắng CIVASAN spf50+ Cypress 30ml	SP CHĂM SÓC DA CIVASAN	\N	Chai	\N	t	1500000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8809610260413	\N	\N	\N	\N	t	\N
61eb6f51-594d-4ba3-bde8-64b91016c67c	CHỐNG NẮNG BALM FOAM LOTION 30ML	SP CHĂM SÓC DA CIVASAN	\N	Chai	\N	t	1280000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8809610260161	\N	\N	\N	\N	t	\N
fa57285a-dbb4-4e53-a502-7b434f08b929	KEM DƯỠNG GOLD MEDIUM CREAM 50ML	SP CHĂM SÓC DA K.B PURE	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7290109250007	\N	\N	\N	\N	t	\N
4bda9025-5e81-4527-bb38-09bc6a2f56b2	KEM PHỤC HỒI VÀ LÀM DỊU DA KHẨN CẤP SKIN RELAXER CREAM 50ML	SP CHĂM SÓC DA K.B PURE	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7290109251066	\N	\N	\N	\N	t	\N
1e10acb0-7ce6-41c6-bd65-82ffe5262ed6	KEM DƯỠNG ẨM ( da khô) SIMPLE PURE DRY SKIN 50ML	SP CHĂM SÓC DA K.B PURE	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7290109253022	\N	\N	\N	\N	t	\N
3a73e06e-fdfa-4587-b7f2-2925a2d97ed2	XỊT HUYẾT THANH CẤP ẨM SKIN RELAXER SPRAY 60ML	SP CHĂM SÓC DA K.B PURE	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: XỊT HUYẾT THANH	\N	\N	\N	\N	t	\N
2c16f777-9745-49c9-998f-18085e902c5a	GEL RỬA MẶT TINH CHẤT CHÀM TRÀ PURE TEA TREE SOAP 75ML @	SP CHĂM SÓC DA K.B PURE	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: GEL RỬA MẶT	\N	\N	\N	\N	t	\N
4c4d38e6-8cf6-4afe-bd28-da5ce824389b	SERUM CẤP NƯỚC TRẺ HOÁ VÀ PHỤC HỒI DA  50ML	SP CHĂM SÓC DA K.B PURE	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7290100369579	\N	\N	\N	\N	t	\N
00306aa5-fb50-4059-a5e3-b1263bab6e83	HUYẾT THANH TRẺ HOÁ DA DÉCAAR	SẢN PHẨM LÀM ĐẸP	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 5292979000258	\N	\N	\N	\N	t	\N
73bd1e2f-3448-421e-8c66-888af1665ec1	GENTLE TONER PURLES 118 200ML	SẢN PHẨM LÀM ĐẸP	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 5902706291186	\N	\N	\N	\N	t	\N
8f53a40f-187f-420f-b938-908a90b92b56	LOTION TẨY TẾ BÀO CHẾT VÀ LÀM SÁNG DA EXF 250ML	SẢN PHẨM LÀM ĐẸP	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3401382761966	\N	\N	\N	\N	t	\N
e65182ad-226f-45c0-9908-06bd5cecd5c1	TINH DẦU LOST IN DALAT 30ML	SẢN PHẨM LÀM ĐẸP	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8936181030289	\N	\N	\N	\N	t	\N
fcfcfd6b-edbc-4393-b4cc-d93152c73426	KEM DƯỠNG ẨM ( da dầu - hỗn hợp) GOLD MEDIUM CREAM 50ML	SP CHĂM SÓC DA K.B PURE	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7290109250014	\N	\N	\N	\N	t	\N
0d2ccf2f-93ac-4cf6-97df-4e8f81ee174a	THUỐC NHUỘM RG BLU	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP783278	\N	\N	\N	\N	t	\N
a1efe9fa-52bc-4611-aa41-c46dcdadf8e3	DẦU GỘI DETOXIFYING GIẢI ĐỘC THANH LỌC 250ML	CHĂM SÓC TÓC DAVINES	\N	Chai	\N	t	424000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 8004608256533	250	ml	\N	\N	t	\N
a6717ed8-120c-489a-bd17-4e65171f4424	KERATHERAPY PURE RENEWAL PLUS+  1000ML	CHĂM SÓC KERATIN	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 856938008096\nANH TÂM NHẬP	1000	ml	\N	\N	t	\N
b1bc7691-239f-4eba-807c-b951ba622951	DẦU GỘI TÍM FANOLA 1000ML	Fanola	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8032947861477\nNHẬP SHOPPE	1000	ml	\N	\N	t	\N
7f02983b-8824-423a-b18c-d4cf9150037a	ĐẾ SẠC KHÔNG DÂY GLAMPAIM	MÁY SẤY, KẸP GLAMPALM	\N	Cái	\N	t	1290000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: GP805	\N	\N	\N	\N	t	\N
3aeaa205-aa59-4545-a9b1-7fc517b7f45a	THUỐC NHUỘM AVEDA DARK - GREY GREEN Gr/G	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084033388	80	ml	\N	\N	t	\N
1c2d1e53-e6ee-4acd-8591-a85d7fda934e	THUỐC NHUỘM AVEDA DARK - NATURAL NATURAL N/N	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084035757	\N	\N	\N	\N	t	\N
5ed5e57f-32ed-4b74-824d-0c400b4878e2	THUỐC NHUỘM AVEDA LIGHT - NATURAL NATURAL N/N	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084033302	\N	\N	\N	\N	t	\N
add2c1b6-89bf-46af-9488-196074022df7	SÁP PINK REUZEL 113G	CHĂM SÓC TÓC DAVINES	\N	Hũ	\N	t	581000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 869519000020	\N	\N	\N	\N	t	\N
cc2c4a84-d365-41d9-b6e3-09ac2bdbb715	SÁP PINK REUZEL 340G	CHĂM SÓC TÓC DAVINES	\N	Hũ	\N	t	1094000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 869519000044	\N	\N	\N	\N	t	\N
f8ebe04a-765f-4aef-a159-ae60cb414923	DẦU GỘI YOUTHLOCK BỔ SUNG COLLAGEN PHỤC HỒI TÓC 1000ML / 2694225	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1550000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469524001	1000	ml	\N	\N	t	\N
b8d52358-98bb-46c8-80f1-dd154c601e9a	DẦU XẢ YOUTHLOCK BỔ SUNG COLLAGEN PHỤC HỒI TÓC 1000ML / 2694200	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1550000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469523967	1000	ml	\N	\N	t	\N
eeda8ee1-934b-459a-b375-9c4ef537f996	BỘT TẨY 9+ JOICO 450G	KỸ THUẬT JOICO	\N	Túi	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP787962	450	ml	\N	\N	t	\N
ba4b9fdd-5d40-43c0-85ce-9c85405c429b	CỘT TÓC	PHỤ KIỆN	\N	Cái	\N	t	130000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: PK	\N	\N	\N	\N	t	\N
afc67c71-f061-4c59-b608-8ad26c0ff00e	BỘ TÓC ĐỘI SIÊU DA ĐẦU (NGẮN)	PHÍM TÓC, TÓC MÁI	\N	Cái	\N	t	7000000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SIEUDACHENGOI40CM	\N	\N	\N	\N	t	\N
c9b827fc-9875-43a2-bc6b-44f4b03bb9cb	BỘ TÓC ĐỘI SIÊU DA ĐẦU ( VỪA)	PHÍM TÓC, TÓC MÁI	\N	Cái	\N	t	10000000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SIEUDACHENGOI50CM	\N	\N	\N	\N	t	\N
588a2b79-7eff-4f8b-9348-90d22f1b9352	SÁP CONCRETE POMADE HOLD MATTE ( xám) 340g	CHĂM SÓC TÓC DAVINES	\N	Hũ	\N	t	1094000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 850020289905	\N	\N	\N	\N	t	\N
511772ce-fd4c-44c5-a331-6bc7b8383d2c	MẶT NẠ KS SMOOTHING MASK 200ML	CHĂM SÓC GOLDWELL	\N	Hũ	\N	t	950000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609850847	200	ml	\N	\N	t	\N
0ef3bd2d-9037-44f8-9625-fbd97c31f899	GEL TẠO KIỂU VÀ GIỮ NẾP TÓC JOIGEL MEDIUM 250ML / 2620779	CHĂM SÓC TÓC JOICO	\N	Tuýp	\N	t	590000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469523073	250	ml	\N	\N	t	\N
e7f215a3-d9fb-42e0-859a-6816a57a4900	GEL TẠO KIỂU ZERO HEAT for thick hair 150ML	CHĂM SÓC TÓC JOICO	\N	Tuýp	\N	t	590000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469512817	150	ml	\N	\N	t	\N
ca8b34be-79be-49cb-b0b7-575809eb14ce	GE TẠO KIỂU ZERO HEAT for fine/medium hair 150ml	CHĂM SÓC TÓC JOICO	\N	Tuýp	\N	t	590000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469512800	150	ml	\N	\N	t	\N
a3859333-30da-4871-aa6b-24601c0f6d1e	DƯỠNG TÓC K-PAK CT LL GLOSS OIL 63ML / J16328	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	560000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469515214	63	ml	\N	\N	t	\N
f59a269f-a8b3-4220-b1ab-9a18e2525c30	KERATIN DỪA  1000ML	A HẢI	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 0700220277090	1000	ml	\N	\N	t	\N
105c2fbc-6cba-4799-bdd9-5c7010f16344	NƯỚC DƯỠNG GROOMING TONIC 100ML	CHĂM SÓC TÓC DAVINES	\N	Chai	\N	t	277000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 852578006973	100	ml	\N	\N	t	\N
3426553a-04fb-46dd-ab15-47d78fc9781a	BỘT TẨY SÁNG MÀU VEROLIGHT LIGHTENER 450G	KỸ THUẬT JOICO	\N	Túi	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP799189	\N	\N	\N	\N	t	\N
3f88c16f-3303-4046-b9ec-24e5f43108f8	KEM NHUỘM VERO K-PAK UHLA	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP799193	74	ml	\N	\N	t	\N
2505d7a3-1c17-4e8d-aa5b-d02816a52837	KEM NHUỘM VERO K-PAK UHLP	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP799197	74	ml	\N	\N	t	\N
463516da-8bbb-4389-82c9-c5f566dc5613	KEM NHUỘM VERO K-PAK 4A	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP799199	74	ml	\N	\N	t	\N
7bae00c8-5abe-4270-af1d-ef8e7cfbbc9f	KEM NHUỘM VERO K-PAK  8B	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP799201	74	ml	\N	\N	t	\N
f6a41728-a7da-4b8d-9d7b-53c429403e2d	ÁO CHOÀNG PRAVANA ĐEN	KỸ THUẬT PRAVANA	\N	Cái	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP799205	\N	\N	\N	\N	t	\N
260cd449-17db-4f35-a9d4-3181040802f2	ÁO CHOÀNG JOICO MÀU TRẮNG	KỸ THUẬT JOICO	\N	Cái	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP799207	\N	\N	\N	\N	t	\N
4f99b2bc-078e-4d89-93b7-73d6ead21bfd	Màu nhuộm bán bền PRAVANA Express Tones After Dark N	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2575924	\N	\N	\N	\N	t	\N
504799aa-420e-4d1c-9822-38d849f64d48	BỘT TẨY PRAVANA NÂNG SÁNG 9 CẤP ĐỘ BLONDING 453g	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP799225	\N	\N	\N	\N	t	\N
5dee13c5-0c39-4244-833c-6d9229d338db	BỘT TẨY PRAVANA NANG SÁNG 7 CẤP ĐỘ POWER 680g	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP799226	\N	\N	\N	\N	t	\N
7dade6ed-4058-46bd-9330-9ac7291c904f	KEM NHUỘM LUMISHINE 5BA	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP799227	74	ml	\N	\N	t	\N
3779415e-c95c-4978-b9de-4a3ebb4c0730	KEM NHUỘM VERO K-PAK GRAY CONTROL	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP799649	74	ml	\N	\N	t	\N
48f1f170-fdef-4247-9763-4a5132df7a97	DẦU GỘI K-PAK CLARIFYING 1000ML / 2923102	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1250000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469517133	1000	ml	\N	\N	t	\N
ee8eaecf-01b0-4953-bfc7-c1a5a76af4b1	THUỐC NHUỘM OX5	Cty TNG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP806219	100	ml	\N	\N	t	\N
4964f270-580b-49a0-9d92-a12e05620ff1	Màu nhuộm Bền PRAVANA 5N light brown	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2505285	\N	\N	\N	\N	t	\N
65bf9900-9a6b-4336-8b1c-ab03f6328732	Trợ nhuộm PRAVANA ZERO LIFT	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2702458	1000	ml	\N	\N	t	\N
def04071-a730-4082-a7ac-7ccce0ae78e3	Trợ nhuộm PRAVANA 40 VOL	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2702470	1000	ml	\N	\N	t	\N
fe8ca978-ba16-41de-a77f-216924481d59	OXY TRỢ NHUỘM PRAVANA  30 VOL	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2702471	1000	ml	\N	\N	t	\N
87a3092b-c75e-48a1-ad3e-ed8ca0f68560	TRỢ NHUỘM PRAVANA  20 VOL	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2702472	1000	ml	\N	\N	t	\N
0f7be09e-fe06-4e49-bb80-e356b311c313	TRỢ NHUỘM PRAVANA 10 VOL	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2702473	1000	ml	\N	\N	t	\N
4b346bde-e4e4-4463-8d37-667f6a6b287e	Màu nhuộm trực tiếp PRAVANA Neon Yellow	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 7501438384388	\N	\N	\N	\N	t	\N
21439224-50e8-4d03-acb0-eb6b5a0d6ca9	Màu nhuộm trực tiếp PRAVANA Neon Green	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 7501438384401	\N	\N	\N	\N	t	\N
bbb8ca1a-0ce8-42ff-80f9-733d7741de6d	Màu nhuộm trực tiếp PRAVANA  Luscious Lavender	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2687145	\N	\N	\N	\N	t	\N
075a4872-bef3-42d9-a88e-d66a5b9106b5	Màu nhuộm trực tiếp PRAVANA Pretty in Pink	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2551610	\N	\N	\N	\N	t	\N
48c9e762-5770-4337-9b39-67e41ecdc779	Màu nhuộm trực tiếp PRAVANA  Smokey Silver	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 7501438386610	\N	\N	\N	\N	t	\N
30b6d058-9753-4d56-bc2f-cf474c59e725	Màu nhuộm trực tiếp PRAVANA Silver	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2687147	\N	\N	\N	\N	t	\N
36834391-edea-4ac8-b6d6-9bc01a981fa6	Màu nhuộm bán bền PRAVANA Sand	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2796682	\N	\N	\N	\N	t	\N
81d39341-3bdc-4e81-b553-1c65b96f8f7b	Màu nhuộm bán bền PRAVANA  6BV Dark Beige Blonde 2884020	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 7501438389901	\N	\N	\N	\N	t	\N
c51b93a1-e85f-48f3-ab88-02c24991179f	Màu nhuộm bán bền PRAVANA 8BV Light Beige Blonde 2884019	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 7501438389895	\N	\N	\N	\N	t	\N
6677ba31-52b6-401f-aac5-4c3febe1e05a	Màu nhuộm bán bền PRAVANA gel  Clear	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2884018	\N	\N	\N	\N	t	\N
17236137-05eb-48ff-85e4-13e53d4951ee	Màu nhuộm bán bền PRAVANA  10Abv Ultra Light Ash Beig 2884016	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 7501438389864	\N	\N	\N	\N	t	\N
0a3c100e-96af-418d-a63a-64470a954bc7	Thuốc nhuộm joico lumi10 3N	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2694216	\N	\N	\N	\N	t	\N
d06344aa-ca52-4e9e-b1b0-c345d7023276	Dầu gội aveda trị rụng ivati light 50ml	CHĂM SÓC AVEDA	\N	Chai	\N	t	265000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084022870	50	ml	\N	\N	t	\N
004cd5d4-8b9b-4cce-ba59-46e7f5058c49	Màu nhuộm bán bền PRAVANA 9Nt Very Light Neutral Blo 2884004	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 7501438389741	\N	\N	\N	\N	t	\N
8f49487e-4a59-47d9-b11b-a7f404651ea8	Màu nhuộm bán bền PRAVANA 10Nt Extra Light Neutral B 2884003	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 7501438389734	\N	\N	\N	\N	t	\N
1b579721-6838-4807-ab10-c94520226066	Màu nhuộm bán bền PRAVANA 7Abv Ash Beige Blonde 2884001	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 7501438389710	\N	\N	\N	\N	t	\N
bb17aebf-64f2-4fca-b185-b40508c580ac	Màu nhuộm bán bền PRAVANA 10b Ultra Sheer Blue Blond 2883999	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 7501438389697	\N	\N	\N	\N	t	\N
eff519a2-56f3-4f3b-9433-09277dee7199	Màu nhuộm bán bền PRAVANA 9Gbv Very Light Golden Bei	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2883998	\N	\N	\N	\N	t	\N
a084a1d2-4099-43a4-bb21-d2c3fe2d9df3	Màu nhuộm bán bền PRAVANA Express Tones after Dark M	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 7501438388270	\N	\N	\N	\N	t	\N
2d6bccd8-7ceb-44e1-a129-588f3c6ab844	Màu nhuộm bán bền PRAVANA Express Tones After Dark N	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2575924	\N	\N	\N	\N	t	\N
4e39a65b-9d0c-498b-9738-91c3bd6a1adb	Màu nhuộm bán bền PRAVANA Express Tones Clear	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2505857	\N	\N	\N	\N	t	\N
30ad7410-88e1-456b-8b50-5e721e6cb897	Màu nhuộm bán bền PRAVANA Express Tones Ash	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 7501438388300	\N	\N	\N	\N	t	\N
ee3d8f5b-bf75-4037-ab62-d828de401739	Màu nhuộm bán bền PRAVANA Express Tones Pearl	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 7501438388294	\N	\N	\N	\N	t	\N
12465c92-3dda-4b98-be60-75a7f7931328	Dầu gội Kerastase cho da dầu 80ml	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1150000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474636954766	80	ml	\N	\N	t	\N
062b2823-f349-4938-bbb3-050a10366789	Màu nhuộm bán bền PRAVANA Express Tones Beige	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 7501438384852	\N	\N	\N	\N	t	\N
178270a4-196c-46d9-9b18-255bdff30f0d	Màu nhuộm bán bền PRAVANA Express Tones Smokey Silver	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 7501438386672	\N	\N	\N	\N	t	\N
d17136f1-4d6c-4b04-9f76-a71823312be7	Màu nhuộm bán bền PRAVANA  6Nt9 / 6Nts Dark neutral Smokey 2800711	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 7501438389260	\N	\N	\N	\N	t	\N
e74fa0b2-dd34-4231-b1f1-4e55eec2e3aa	Màu nhuộm bán bền PRAVANA 8.92 / 8Sbv Light Smokey Beige	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2800700	\N	\N	\N	\N	t	\N
541579f4-199e-4bce-a403-9200f7234a92	Màu nhuộm bán bền PRAVANA 10.91 / 10Sa Extra light Smoke	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2800699	\N	\N	\N	\N	t	\N
5c18b032-73db-4214-bd59-4d5babc51ee2	Màu nhuộm bán bền PRAVANA 10.02 / 10bv Extra Light Sheer	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2505273	\N	\N	\N	\N	t	\N
3fd0ec8b-41ca-4420-b27b-22e79138555c	Màu nhuộm bán bền PRAVANA 9.23 / 9Bvg Very Light Beige G	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2727652	\N	\N	\N	\N	t	\N
731b5b77-01cb-41fc-8fe6-db850dd4cb7d	Màu nhuộm bán bền PRAVANA 9.22 / 9BVBV Very Light Intens	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2505837	\N	\N	\N	\N	t	\N
9d788767-8c11-4f9d-9730-eb3018584be5	Màu nhuộm bán bền PRAVANA 8.22 / 8BVBV Light Intense Bei	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2505838	\N	\N	\N	\N	t	\N
22bbd7e9-d1a6-4b0f-bd5d-96ca66b43f0e	Màu nhuộm bán bền PRAVANA 7.22 / 7BVBV Intense Beige Blo	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2505839	\N	\N	\N	\N	t	\N
f9374e41-8456-4ed3-a8b7-0bb46018f45e	Màu nhuộm bán bền PRAVANA 6.23 / 6Bvg Dark Beige Golden	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2505785	\N	\N	\N	\N	t	\N
fd503ed6-2630-4e0b-b296-4f253e3ddd0f	Màu nhuộm bán bền PRAVANA 6.22 / 6BVBV Dark Intense Beig	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2505840	\N	\N	\N	\N	t	\N
31ce6dba-263e-4c25-9dc8-8a197dc7870a	Màu nhuộm bán bền PRAVANA 5.22 / 5BVBV Light Intense Bei	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2727596	\N	\N	\N	\N	t	\N
3a80c426-c2cf-41ae-8149-0457f59d78f4	Màu nhuộm bán bền PRAVANA 10.07 / 10v Extra Light Sheer	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2505271	\N	\N	\N	\N	t	\N
68079424-0606-41dd-b556-aef03edf0699	Màu nhuộm bán bền PRAVANA 10.72 / 10Vbv Extra Light Violet	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2506364	\N	\N	\N	\N	t	\N
04b8c71c-beba-48be-a247-0da5665e3b2c	Màu nhuộm bền PRAVANA 9.7 / 9V Very Light Violet Blo	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2506367	\N	\N	\N	\N	t	\N
677fa809-6fc6-4d2f-bee4-5b82484c628d	Màu nhuộm bền PRAVANA 8.7 / 8V Light Violet Blonde	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2506369	\N	\N	\N	\N	t	\N
55d8ea26-b50f-4c0e-afb2-a9006785a13f	Màu nhuộm bền PRAVANA 5.7 / 5V Light Violet Brown	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2505783	\N	\N	\N	\N	t	\N
3807d35a-60d9-421d-be86-941359363c5c	Màu nhuộm bán bền PRAVANA 10.08 / 10p Extra Light Sheer	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2648587	\N	\N	\N	\N	t	\N
a93c08a3-ddad-4509-b3c4-d69a1127aab1	Màu nhuộm bán bền PRAVANA 9.8 / 9P Very Light Pearl Blonde	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2648588	\N	\N	\N	\N	t	\N
693ccb4d-b999-4112-8e04-4a1a90cd9f14	Màu nhuộm bán bền PRAVANA 8.8 / 8P Light Pearl Blonde	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2648586	\N	\N	\N	\N	t	\N
5f8c4af5-dcc6-4850-8b60-0c3d436f8b35	Màu nhuộm bán bền PRAVANA 7.8 / 7P Pearl Blonde	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2648585	\N	\N	\N	\N	t	\N
e06a4c74-f1f1-420a-97bc-16c6d39c4a78	Màu nhuộm bán bền PRAVANA 6.8 / 6P Dark Pearl Blonde	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2648584	\N	\N	\N	\N	t	\N
e06beec3-0dfa-413d-a4a8-0208edae8aaf	DẦU GỘI DAVINES TRƯỜNG THỌ 1000ML	CHĂM SÓC TÓC DAVINES	\N	Chai	\N	t	1083000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 8004608255109	1000	ml	\N	\N	t	\N
0e73a6ff-7b87-4b18-b23e-4c9b4aa3acc4	KEM NHUỘM RG 7.8	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182690787	\N	\N	\N	\N	t	\N
c95f967a-a749-4151-95f7-c40a90721eaf	BỘT TẨY PRAVANA NÂNG SÁNG 9 CẤP ĐỘ ULTRA 30g	KỸ THUẬT PRAVANA	\N	Gói	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438387662	\N	\N	\N	\N	t	\N
4696ed92-abc8-400c-924d-6c25c22b1921	BỘT TẨY PRAVANA NÂNG SÁNG 7 CẤP ĐỘ POWER 42g	KỸ THUẬT PRAVANA	\N	Gói	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438381615	\N	\N	\N	\N	t	\N
3a3c3261-e5f8-46b9-81a1-61b7183914c3	MÀU NHUỘM MG 6-NB	KỸ THUẬT BOMANE	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP814329	\N	\N	\N	\N	t	\N
98544e70-9e4c-448c-84a4-a78af6059040	MÀU NHUỘM MG 7-NB	KỸ THUẬT BOMANE	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP814330	\N	\N	\N	\N	t	\N
e3abac04-86e5-4a43-8263-13a5578c9e2d	MÀU NHUỘM MG 6-CB	KỸ THUẬT BOMANE	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP814331	\N	\N	\N	\N	t	\N
4a5aab73-ccba-4b22-8501-27143bbf70ba	MÀU NHUỘM MG 7-CB	KỸ THUẬT BOMANE	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP814333	\N	\N	\N	\N	t	\N
1dd78cdd-abc1-443a-a28b-52e17ce97ec3	MÀU NHUỘM MG 9-10	KỸ THUẬT BOMANE	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP814334	\N	\N	\N	\N	t	\N
91077608-c7c3-448f-ae1a-61e738481583	MÀU NHUỘM MG 9-20	KỸ THUẬT BOMANE	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP814335	\N	\N	\N	\N	t	\N
c639d61b-0eaf-4da3-99c1-662f4ba8c952	MÀU NHUỘM MG 9-40	KỸ THUẬT BOMANE	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP814336	\N	\N	\N	\N	t	\N
7cb7f9a8-c266-48a2-b114-485290249373	MÀU NHUỘM MG 9-55	KỸ THUẬT BOMANE	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP814337	\N	\N	\N	\N	t	\N
98e20ab1-0a6b-4035-b733-b38088c05cbb	MÀU NHUỘM MG 9-SRMV	KỸ THUẬT BOMANE	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP814341	\N	\N	\N	\N	t	\N
80289dcd-94ac-481f-9f43-1c89e9bfd67c	MÀU NHUỘM MG 9-SMA	KỸ THUẬT BOMANE	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP814342	\N	\N	\N	\N	t	\N
77697c85-85d5-40eb-8490-d4bcee151a54	MÀU NHUỘM MG 9-mNV	KỸ THUẬT BOMANE	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP814343	\N	\N	\N	\N	t	\N
72d7db31-5c99-4996-993b-fb715fd2066b	MÀU NHUỘM MG 9-iPT	KỸ THUẬT BOMANE	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP814346	\N	\N	\N	\N	t	\N
c82b7c98-bfbf-48c1-827a-6cdf6a89fecf	MÀU NHUỘM MG 13-10	KỸ THUẬT BOMANE	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP814348	\N	\N	\N	\N	t	\N
4310cdc3-b7a1-458b-abeb-cafc9a7a8eac	MÀU NHUỘM MG 13-20	KỸ THUẬT BOMANE	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP814349	\N	\N	\N	\N	t	\N
eb8415b3-83e2-4e76-bc3a-bd55a8b9e605	MÀU NHUỘM MG 13-40	KỸ THUẬT BOMANE	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP814350	\N	\N	\N	\N	t	\N
83460e90-4a9a-4257-b794-5f755488d3fc	MÀU NHUỘM MG 13- srMV	KỸ THUẬT BOMANE	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP814370	\N	\N	\N	\N	t	\N
b38fe524-a9e0-4180-9ed9-cacdf412c188	MÀU NHUỘM MG 13-sMA	KỸ THUẬT BOMANE	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP814371	\N	\N	\N	\N	t	\N
9b893fa9-ec99-4dd2-a774-1659263b36b2	MÀU NHUỘM MG 13-MNV	KỸ THUẬT BOMANE	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP814372	\N	\N	\N	\N	t	\N
75067de7-53f3-4672-a795-53535615ea4f	MÀU NHUỘM MG 13-PGG	KỸ THUẬT BOMANE	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP814373	\N	\N	\N	\N	t	\N
884f5e2d-057f-487a-ac78-07396f8a51d9	MÀU NHUỘM MG 13-iPT	KỸ THUẬT BOMANE	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP814374	\N	\N	\N	\N	t	\N
c1a620fb-1726-4dbd-ab4b-ef369a1b5411	MIX MEGEI S065	KỸ THUẬT BOMANE	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP814375	\N	\N	\N	\N	t	\N
d2c64876-0a14-44a8-b221-30eef5e960d7	MIX MEGEI S0688	KỸ THUẬT BOMANE	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP814376	\N	\N	\N	\N	t	\N
db638bad-3596-418f-b92b-2630ddb0a012	MIX MEGEI S086	KỸ THUẬT BOMANE	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP814378	\N	\N	\N	\N	t	\N
b1133720-6a9c-4067-bc7c-363bbf46c4ca	MẶT NẠ PHỤC HỒI, DƯỠNG ẨM KERASILK 200ML	CHĂM SÓC GOLDWELL	\N	Hũ	\N	t	950000	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609850779	200	ml	\N	\N	t	\N
cb9f9a33-a101-4abd-87f4-8ddb8ecab029	Màu nhuộm bền pravana MYSTIC MAGEBTA 90ML	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 2557936	\N	\N	\N	\N	t	\N
4173970d-a88c-411d-af42-9da922877757	Màu nhuộm bền pravana PASTEL POTION 90ML	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438387372	\N	\N	\N	\N	t	\N
3f18c36f-2481-4a14-aa62-93ca7f8f158b	Màu nhuộm bền pravana SCARLETTE RED 90ML	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 2557933	\N	\N	\N	\N	t	\N
fa068abd-63ec-4a82-b5ef-c214be64a85d	Màu nhuộm bền pravana VIOLET REIGN 90ML	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438387853	\N	\N	\N	\N	t	\N
3a756d5e-65d5-4d27-ac97-404f47dcd5c2	Màu nhuộm trực tiếp pravana PURPLE TOURMALINE 90ML	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 2687154	\N	\N	\N	\N	t	\N
d1fede23-a413-444b-9888-1c2151dd601f	Màu nhuộm trực tiếp pravana VIOLET 90ML	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438381288	\N	\N	\N	\N	t	\N
c3a75583-ff49-4b8a-85e8-5e96a1e09b87	Màu nhuộm trực tiếp pravana Blue 90ml	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438381301	\N	\N	\N	\N	t	\N
d28f3a9e-5905-49e9-ab99-8a387241fa4e	Màu nhuộm trực tiếp pravana Black ( additive ) 90ml	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438385088	\N	\N	\N	\N	t	\N
2413cab6-e99a-43e2-a336-cb67aefa936c	Màu nhuộm trực tiếp pravana Periwinkle 90ml	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438389956	\N	\N	\N	\N	t	\N
84b67757-fffd-4db2-a4d1-b94cb354a230	Màu nhuộm trực tiếp pravana Smokey Violet 90ml	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438389949	\N	\N	\N	\N	t	\N
30a47a8e-58f3-463c-842d-b4856a84dc6e	Màu nhuộm trực tiếp pravana Grape 90ml	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438389932	\N	\N	\N	\N	t	\N
08da5992-f54b-4ec1-a6a6-f75a6815acbc	Màu nhuộm JOICO lumishine 4VV	KỸ THUẬT JOICO	\N	Tuýp	\N	t	300000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP815190	\N	\N	\N	\N	t	\N
5d515fc8-a582-4730-963d-4fd850f93230	Màu nhuộm JOICO vero k-pak 4VR	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP815191	\N	\N	\N	\N	t	\N
c74bb7ff-a068-4dda-92d0-d37850aba89e	Bảng màu JOICO 2022 LUMI10	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2786279	\N	\N	\N	\N	t	\N
bac43968-7ed5-41a6-b2db-71f484d5b247	JOICO color Intesity semi- permanen SOFT PINK 118ML	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 152101	\N	\N	\N	\N	t	\N
bff5eac3-61c4-42be-8330-82f6a16efc06	MÀU NHUỘM JOICO VERO K-PAK 3N	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP816138	\N	\N	\N	\N	t	\N
48b1a555-8bae-4e57-941d-7a6c4d652ab5	MÀU NHUỘM JOICO VERO K-PAK 4NRV+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP816139	\N	\N	\N	\N	t	\N
cef472dd-982f-4e6a-8aec-a7c5022e0c24	MÀU NHUỘM BÁN BỀN PRAVANA 7Cr Copper Red Blonde 90ml 2884013	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438389833	\N	\N	\N	\N	t	\N
655f6e4a-de5f-4c8c-92a5-c70c376b7e5b	MÀU NHUỘM BỀN PRAVANA  9N	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP816149	\N	\N	\N	\N	t	\N
3a303f53-e607-46f6-8263-8f2087eff8b2	MÀU NHUỘM BỀN PRAVANA 8N	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP816150	\N	\N	\N	\N	t	\N
46141e72-f36e-425d-b712-b4c686f11358	MÀU NHUỘM BỀN PRAVANA  7N	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP816153	\N	\N	\N	\N	t	\N
b3208a12-ae96-4a4a-85fb-5bbe4c7fa562	MÀU NHUỘM BỀN PRAVANA  9.1 / 9A	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP816154	\N	\N	\N	\N	t	\N
9fd76969-86c0-4c24-8063-69486abbb775	MÀU NHUỘM BỀN PRAVANA 8.1 / 8A	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP816155	\N	\N	\N	\N	t	\N
9502f3c3-bfb2-44c5-ad14-0af4b45c0b32	MÀU NHUỘM BỀN PRAVANA  7.1 / 7A	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP816156	\N	\N	\N	\N	t	\N
d6a41be1-b9a6-4204-8d14-1e686c5155b3	BỘ TÓC ĐỘI SIÊU DA ĐẦU (DÀI)	PHÍM TÓC, TÓC MÁI	\N	Chai	\N	t	16000000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: BỘ TÓC ĐỘI	\N	\N	\N	\N	t	\N
988d99b6-3b8c-4f62-9be0-9fbe14931160	TC 7KG - 250ML	KỸ THUẬT GOLDWEL	\N	Ống	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: SP819217	250	ml	\N	\N	t	\N
b4b79eb9-4ec5-4f5b-8605-f777ec0243fb	TC 7K - 250ML	KỸ THUẬT GOLDWEL	\N	Ống	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: SP819219	250	ml	\N	\N	t	\N
9470664e-f841-4848-9469-a4c40b20377c	KEM NHUỘM RIGHT 5.2	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182690510	\N	\N	\N	\N	t	\N
8cbbe7f5-7df6-42e2-a3f4-735c65298803	UỐN/ÉP Structure + Shine Agent 1-1 400ml	KỸ THUẬT GOLDWEL	\N	Túi	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: SP819223	400	ml	\N	\N	t	\N
481232a0-acc4-42ed-a528-328017ab4611	UỐN/ÉP Structure + shine Agent 1-2 400ml	KỸ THUẬT GOLDWEL	\N	Túi	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: SP819224	400	ml	\N	\N	t	\N
19cf2475-25a7-491b-8aa5-c90c29a86816	UỐN/ÉP Structure + shine Agent 1-3 400ml	KỸ THUẬT GOLDWEL	\N	Túi	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: SP819226	400	ml	\N	\N	t	\N
43b34baa-7440-4e75-8b99-f601f6131697	UỐN Structure + shine Agent 2 Lotion  1000ml	KỸ THUẬT GOLDWEL	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: SP819232	1000	ml	\N	\N	t	\N
7119bb9c-1b11-4513-bf0a-6e80ba8b5e0b	MÀU NHUỘM TOPCHIC 6KR - 250ml	KỸ THUẬT GOLDWEL	\N	Ống	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: SP819233	250	ml	\N	\N	t	\N
cfbebffd-14c7-47ff-b0af-f3986b50b83e	TÓC PHÍM	PHÍM TÓC, TÓC MÁI	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP821198	\N	\N	\N	\N	t	\N
93780bc5-7c08-499e-bc3c-11d10747998e	THẠCH SÂM	THẠCH SÂM	\N	Chai	\N	t	1650000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8809524840367	\N	\N	\N	\N	t	\N
19f571f7-191d-4c4b-a647-295303e0c700	MÀU NHUỘM LUMISHINE 6CC 74ml	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP822073	74	ml	\N	\N	t	\N
3d563ec7-aeed-4cac-9bff-8db285136eae	MÀU NHUỘM LUMISHINE 7CC 74ml	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP822074	74	ml	\N	\N	t	\N
f83b4e14-8c37-40d5-a480-bec2acf1978c	MÀU NHUỘM LUMISHINE 7NC 74ml	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP822075	74	ml	\N	\N	t	\N
e2657bca-1cc0-4959-8651-3f2565ad9985	MÀU NHUỘM LUMISHINE 6NC 74ml	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP822076	74	ml	\N	\N	t	\N
2301f98d-de4c-40c2-b33b-57de062d7242	SÁP EXTREME HOLD POMADE - 340G	CHĂM SÓC TÓC DAVINES	\N	Hũ	\N	t	1094000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: SP822724	\N	\N	\N	\N	t	\N
6ef70318-736d-420e-aad3-50ddc63625c7	MÀU NHUỘM AGE DEFY PERM 9NB+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP824235	74	ml	\N	\N	t	\N
6d64a3a9-5480-4cdb-b574-2dda334ff5c7	MẶT NẠ ĐẤT SÉT KERASTASE CHO DA ĐẦU DẦU 250ML	CHĂM SÓC KERASTASE	\N	Hũ	\N	t	1650000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636954681	250	ml	\N	\N	t	\N
1d71ccd8-8d7e-40bc-8ef2-bde2a1d72336	DẦU XẢ PHỤC HỒI BOTANICAL 40ML	CHĂM SÓC AVEDA	\N	Tuýp	\N	t	245000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084019528	40	ml	\N	\N	t	\N
222e55a5-f4c7-4436-b6ea-f5893f6332ff	PERMANENT COLOR CREAM 6.35	KỸ THUẬT VŨ LỘC	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP829586	100	ml	\N	\N	t	\N
0af5873c-b759-4c19-ab8a-e9486df016ef	PERMANENT COLOR CREAM 8.35	KỸ THUẬT VŨ LỘC	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP829587	100	ml	\N	\N	t	\N
f4c10a42-02dd-4ee4-9f68-71c2b2d236f5	BỘ sp dưỡng tóc Defy Damage Pro salon Kit-NA ( 4 sp)	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: J16161	\N	\N	\N	\N	t	\N
9051a5b5-e8f8-465a-8993-3c8986dab2f5	MẶT NẠ GIẢM GÃY RỤNG INVATI  40ML	CHĂM SÓC AVEDA	\N	Tuýp	\N	t	350000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084022955	40	ml	\N	\N	t	\N
0356e269-58b2-4717-9697-2038cd7aec50	KERATIN CLEAN START 500ML	CHĂM SÓC KERATIN	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 852979006626	\N	\N	\N	\N	t	\N
1e539fcc-86b3-442d-a4c5-4e18516dc95b	KEM NHUỘM RIGHT 4.2	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182690503	\N	\N	\N	\N	t	\N
77dba871-2d2c-4cfd-a6fe-7068608b10c4	Sữa Rửa Mặt dịu nhẹ làm mềm da Comfort Zone Essential Milk 150ml	[COMFORT ZONE]	\N	Chai	\N	t	836000	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 80044608505761	150	ml	\N	\N	t	\N
28e8eae8-ff81-47b5-ba8c-6315ddd2eeaf	Tẩy Trang Dịu Nhẹ Dành Cho Mắt Comfort Zone Essential Biphasic Makeup Remover 150ml	[COMFORT ZONE]	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: SP837151	150	ml	\N	\N	t	\N
20c3ba5f-5e8c-4c2a-a0cf-e67754a8a73d	Màu nhuộm bán bền pravana 5S light Smokey Brown 90ml	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP837185	90	ml	\N	\N	t	\N
1ba04ac0-e09c-42c9-8097-e39295b64657	Màu nhuộm bán bền pravana Lilac platium 90ml	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438389222	90	ml	\N	\N	t	\N
3617dcff-9f4c-43df-8cc3-8b868d2a5087	màu nhuộm bán bền 6Nt Dark Neutral Blonde 90ml 2884007	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438389772	\N	\N	\N	\N	t	\N
9fc154e4-e991-49f8-8acf-7e9748b48971	Màu nhuộm trực tiếp Clear - Pastel 90ml	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP837189	90	ml	\N	\N	t	\N
bcc0c303-8b08-4c20-8485-6d0847bb0de2	Màu nhuộm trực tiếp Clear - Dilute 90ml	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP837191	90	ml	\N	\N	t	\N
619a8c79-a93d-416a-81fb-b1da8d8f90fa	Màu nhuộm bán bền Smoke 90ml	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP837192	90	ml	\N	\N	t	\N
06ad8a55-2ef8-4bfd-bff3-8a92046fffa4	Màu nhuộm bán bền 7g GoldenBlonde 90ml 2998755	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438302832	90	ml	\N	\N	t	\N
f58694ad-39d2-4aca-a39e-44043f68c663	MÀU NHUỘM pravana GEL BÁN BỀN 6Abv 90ml 2884017	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438389871	\N	\N	\N	\N	t	\N
300312db-5a2a-4ac5-9104-580c58747f1d	BỘT TẢY WELLA BLONDOL 400G	KHÁC	\N	Hũ	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 4064666230757	\N	\N	\N	\N	t	\N
c75422b8-ed72-48b3-8de2-d8998ca3efc2	KEM NHUỘM VKC 7N	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP840338	\N	\N	\N	\N	t	\N
359e33c6-aafa-45b8-a794-ef11ce6b065f	LƯỢC LÔNG HEO RỪNG PHÁP	PHỤ KIỆN	\N	Chai	\N	t	850000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP840517	\N	\N	\N	\N	t	\N
ff9d5f7a-3b94-49f3-8b43-986955b62c58	LƯỢC CHUYÊN CHẢI TÓC NỐI & TÓC HAY RỐI	PHỤ KIỆN	\N	Chai	\N	t	1000000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP840518	\N	\N	\N	\N	t	\N
bc9c612c-8f32-4254-8a52-42350898f127	TINH DẦU KERASTASE ELIXIR (đỏ)  100ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	2200000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474637255886	\N	\N	\N	\N	t	\N
250f7924-f299-4c9a-8303-95523e32a9bb	DẦU GỘI HỒNG  MILBON 150 ML	CHĂM SÓC MILBOL	\N	Chai	\N	t	479000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 4954835291651	\N	\N	\N	\N	t	\N
39d05d1a-6cb3-4030-a001-c35a1ee01b41	ỐNG NHUỘM TC 6SB 250ML -N	KỸ THUẬT GOLDWEL	\N	Ống	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: SP845384	250	ml	\N	\N	t	\N
91d82b46-dcbf-460f-8503-681ccfeabc12	DẦU GỘI HYDRASPLASH CẤP ẨM 1000ML / 2764129	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1250000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP845878	1000	ml	\N	\N	t	\N
a842d3bd-5196-41b5-b916-3e9806c2d5e8	DẦU XẢ HYDRASPLASH CẤP ẨM 1000ML / 2561387	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1250000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469513401	1000	ml	\N	\N	t	\N
b01db441-d669-4f1b-8706-79eced477eb9	DẦU XẢ BỔ SUNG SẮC TỐ TÍM color balance purple 250ml / 2620519	CHĂM SÓC TÓC JOICO	\N	Tuýp	\N	t	620000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469519243	250	ml	\N	\N	t	\N
5aebe4d3-6888-441e-931d-96f2f96bcd93	DẦU GỘI BLONDE LIFE BRT TÓC TẨY 300ML / 2643578	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	620000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469513296	300	ml	\N	\N	t	\N
55a247e6-fcf5-4eed-94f0-7e2fd8d2d5d9	DẦU XẢ BLONDE LIFE BRT TÓC TẨY 250ML / 2643594	CHĂM SÓC TÓC JOICO	\N	Tuýp	\N	t	620000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 07446913203	250	ml	\N	\N	t	\N
466a116d-7b68-43f4-9d0f-4cf0ab6c8a50	DẦU GỘI BỔ SUNG SẮC TỐ XANH BALANCE BLUE 1000ML / 2620796	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1550000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469519236	1000	ml	\N	\N	t	\N
e95cd301-3cf4-4451-9759-3f7f1c78b44e	DẦU XẢ BỔ SUNG SẮC TỐ XANH BALANCE BLUE 1000ML / 2620643	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1550000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469519212	1000	ml	\N	\N	t	\N
ead09ec5-ba0d-4723-b821-68936d6a2603	DẦU GỘI BLONDE LIFE BRT TÓC TẨY 1000ML / 2643577	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1550000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469513289	1000	ml	\N	\N	t	\N
458b9cc5-9c59-4f0b-8e8c-ba6fa94349b8	DẦU XẢ BLONDE LIFE BRT TÓC TẨY 1000ML / 2643582	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1550000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469513197	1000	ml	\N	\N	t	\N
a79bc278-351c-45d2-bcc3-f46d6214d1a4	KEM DƯỠNG DEFY DAMAGE NGĂN NGỪA HƯ TỔN 100ML / 2453721	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	560000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469509527	100	ml	\N	\N	t	\N
442f347d-e44e-4dd2-ae66-0b8c6d5aeabf	DẦU GỘI BỔ SUNG COLLAGEN YOUTH LOCK 300ML / 2694210	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	620000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469523981	300	ml	\N	\N	t	\N
ee06071f-285d-492f-97f1-38f91fbeb2b2	DẦU XẢ BỔ SUNG COLLAGEN YOUTH LOCK 250ML / 2694235	CHĂM SÓC TÓC JOICO	\N	Tuýp	\N	t	620000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469523950	250	ml	\N	\N	t	\N
76fbd65f-50ab-4b55-8e3f-13005802fb41	DẦU GỘI INNERJOI HYDRATION 1L/ 2842762	CHĂM SÓC JOICO INNERJOI	\N	Chai	\N	t	1650000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469547215	1000	ml	\N	\N	t	\N
c3adfefe-6511-47b5-a244-c6007b811f1b	DẦU XẢ INNERJOI HYDRATION 1000ML/ 2842764	CHĂM SÓC JOICO INNERJOI	\N	Chai	\N	t	1500000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469547291	1000	ml	\N	\N	t	\N
4a3a1173-7f9f-46dc-ab48-a99f720a9ed4	DẦU GỘI INNERJOI HYDRATION 300ML/ 2842765	CHĂM SÓC JOICO INNERJOI	\N	Chai	\N	t	650000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469547376	300	ml	\N	\N	t	\N
138bc20b-fea0-4c18-b3d6-9b499c993892	DẦU XẢ INNERJOI HYDRATION 300ML/ 2842766	CHĂM SÓC JOICO INNERJOI	\N	Chai	\N	t	650000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469547413	300	ml	\N	\N	t	\N
b03f4014-8e48-4cca-ab1d-aad971fd6daa	KEM DƯỠNG ẨM BIOTERA INTNS COOL HYDRATE 177ML	CHĂM SÓC TÓC BIOTERA	\N	Tuýp	\N	t	435000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469547635	177	ml	\N	\N	t	\N
069e0d9a-3113-4ce6-9cde-16b5e0accb9d	XỊT DƯỠNG ẨM INNERJOI HYDRATION 200ML 2848733	CHĂM SÓC JOICO INNERJOI	\N	Chai	\N	t	680000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469548533	200	ml	\N	\N	t	\N
44a407fb-b3ea-4f30-bb06-223e44ec02b1	DẦU GỘI INNERJOI STRENGTHEN 300ML/ 2752475	CHĂM SÓC JOICO INNERJOI	\N	Chai	\N	t	650000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 07446952509	300	ml	\N	\N	t	\N
8796bac6-6ed3-40ae-af7d-fe8bce2df71a	DẦU GỘI INNERJOI STRENGTHEN 1000ML/ 2752476	CHĂM SÓC JOICO INNERJOI	\N	Chai	\N	t	1650000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469525084	1000	ml	\N	\N	t	\N
c4e94d89-c820-4c6c-9514-df1750663eee	DẦU GỘI BIOTERA LONG & HEALTHY DEEP 1000ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	625000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469548373	1000	ml	\N	\N	t	\N
c6dd6792-e6cf-43e3-8b39-c04be6d1d7e2	DẦU XẢ BIOTERA LONG & HEALTHY DEEP 1000ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	625000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469548175	1000	ml	\N	\N	t	\N
07e01d17-5603-413e-8621-cb2f8f939c9f	DẦU XẢ INNERJOI STRENGTHEN 300ML/ 2752478	CHĂM SÓC JOICO INNERJOI	\N	Chai	\N	t	650000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469525060	300	ml	\N	\N	t	\N
2aed10a5-6362-4e65-a640-e913483640ec	DẦU XẢ INNERJOI STRENGTHEN 1000ML/ 2752479	CHĂM SÓC JOICO INNERJOI	\N	Chai	\N	t	1650000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469525053	1000	ml	\N	\N	t	\N
8342af79-e77a-473e-981e-faf6e8cf17f3	DẦU XẢ INNERJOI PRESERVE 1000ML	CHĂM SÓC JOICO INNERJOI	\N	Chai	\N	t	1650000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2750173	1000	ml	\N	\N	t	\N
1fafd37c-c599-4b66-8aa3-805d41774fc6	DẦU XẢ INNERJOI PRESERVE 300ML	CHĂM SÓC JOICO INNERJOI	\N	Chai	\N	t	650000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2751048	300	ml	\N	\N	t	\N
8d95975c-fbb8-42c1-bda1-5474a1bf55fb	DẦU GỘI INNERJOI PRESERVE 1L	CHĂM SÓC JOICO INNERJOI	\N	Chai	\N	t	1650000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2752471	1000	ml	\N	\N	t	\N
ae64a2c7-fc0c-4e5e-988a-3b14a01b8b63	XỊT TẠO KIỂU INNERJOI SEA SALT 150ML/ 2843527	CHĂM SÓC JOICO INNERJOI	\N	Chai	\N	t	680000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469547178	150	ml	\N	\N	t	\N
81585f49-6d28-4ae1-a272-827459c6a21a	DẦU GỘI BIOTERA ULT COLOR CARE 450ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	445000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469544030	450	ml	\N	\N	t	\N
5933b763-44f1-4984-89ef-160c3e9f0d52	DẦU GỘI BIOTERA COLOR CARE 1000ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	625000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469547543	1000	ml	\N	\N	t	\N
6923c90b-ac03-4f4a-b2b8-87803eac7d11	DẦU XẢ BIOTERA ULT COLOR CARE 450ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	445000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469544092	450	ml	\N	\N	t	\N
f3ce97cf-acb4-4e35-bf09-c6a866507236	DẦU GỘI BIOTERA ULT MOISTURE 450ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	445000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469544153	450	ml	\N	\N	t	\N
2ec52b0a-ae26-404f-a4ce-d62026d59811	DẦU GỘI BIOTERA ULT MOISTURE 1000ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	725000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469547529	1000	ml	\N	\N	t	\N
732ed3aa-aac5-4378-8ae1-af6885111155	DẦU XẢ BIOTERA ULT MOISTURE 1000ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	725000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469547536	1000	ml	\N	\N	t	\N
9f5df180-82cc-4943-a434-1fea198f8144	DẦU XẢ BIOTERA ULT MOISTURE 450ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	445000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469544238	450	ml	\N	\N	t	\N
fae1d261-8929-47c8-a976-5d16b153355e	DẦU GỘI BIOTERA MOISTURE 450ML / SP845972	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	345000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469544450	450	ml	\N	\N	t	\N
1300e6d8-8303-4577-a056-ce7575403f36	DẦU XẢ BIOTERA  MOISTURE 450ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	345000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP845975	450	ml	\N	\N	t	\N
3a51db9d-3759-4d8c-9f79-aa28d5473f78	DẦU XẢ BIOTERA MOISTURE 1000ML / SP845977	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	625000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469547574	1000	ml	\N	\N	t	\N
a3dcd59d-8be3-4cbe-a671-9977c29db2bd	DẦU GỘI BIOTERA ULT T&F 450ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	445000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469547819	450	ml	\N	\N	t	\N
e70635fa-7b4e-49e8-82f1-50cb53ad4c0c	DẦU XẢ BIOTERA ULT T&F 450ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	445000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469548014	450	ml	\N	\N	t	\N
e8541c96-7733-4952-bde2-325bcf927adb	DẦU XẢ BIOTERA ULT T&F 1000ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	725000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469547932	1000	ml	\N	\N	t	\N
bf1cdf3b-033a-4215-8edf-4e4911e149eb	DẦU GỘI BIOTERA ULT T&F 1000ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	725000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469548052	1000	ml	\N	\N	t	\N
20eccd50-ad0f-4ce1-b5f8-305dbeeafd34	DẦU GỘI BIOTERA LONG & HEALTHY RICH 450ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	345000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469548250	450	ml	\N	\N	t	\N
9d1a4065-b3c4-4518-93ba-cfe6b47774e0	DẦU XẢ BIOTERA LONG & HEALTHY RICH 450ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	345000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469548298	450	ml	\N	\N	t	\N
9d9f700b-bee3-4d1c-897c-20eac438e94b	DẦU XẢ BIOTERA ULT COLOR CARE 1000ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	725000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469547512	1000	ml	\N	\N	t	\N
5f25ba33-fa87-498b-82ce-1863dae9132d	DẦU GỘI BIOTERA ULT COLOR CARE 1000ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	725000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469547505	1000	ml	\N	\N	t	\N
196b7ecb-7847-4a4e-84b8-0a72a534ba27	TẨY DA CHẾT BIOTERA SCALP SCRUB 177ML	CHĂM SÓC TÓC BIOTERA	\N	Tuýp	\N	t	435000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469547598	177	ml	\N	\N	t	\N
e234ab21-67ea-4885-9302-663fd2340d98	DẦU GỘI BIOTERA ANTI FRIZZ 1000ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	625000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469547857	1000	ml	\N	\N	t	\N
264438dc-0a30-4d09-9e23-84317fc60747	DẦU XẢ BIOTERA ANTI FRIZZ 1000ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	625000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469547895	1000	ml	\N	\N	t	\N
a63311d5-7c4b-4884-b18a-970bfc0a68a1	DẦU GỘI BIOTERA ANTI FRIZZ  450ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	345000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469548090	450	ml	\N	\N	t	\N
a4ea9a4a-90df-4463-a26b-1f7c48cc825b	DẦU XẢ BIOTERA ANTI FRIZZ  450ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	345000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469547970	450	ml	\N	\N	t	\N
81e9d5e5-18d4-4dec-929b-2f72a624cbdb	XỊT TẠO KIỂU BIOTERA FINISH SPRITIZ 237ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	425000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP846010	237	ml	\N	\N	t	\N
a68dbc5b-5b16-4917-8a83-a41853d9c974	DẦU GỘI INNERJOI PRESERVE 300ML	CHĂM SÓC JOICO INNERJOI	\N	Chai	\N	t	650000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2751052	\N	\N	\N	\N	t	\N
3207f447-acf2-4560-ad39-a16307b9425b	DẦU GỘI LOREAL ABSOLUT REPAIR 1500ML	CHĂM SÓC LOREAL	\N	Chai	\N	t	1576000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474636975938	\N	\N	\N	\N	t	\N
9db1a60c-f880-4aee-8094-23c07fad54c9	DẦU GỘI BIOTERA MOISTURIZING DƯỠNG ẨM 1000ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	625000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469547567	\N	\N	\N	\N	t	\N
ad91f3d2-9dbd-47c5-bc46-a13fd64f53b4	MÀU NHUỘM BÁN BỀN PRAVANA 6.37/6Gbv  90ml 2884012	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438389826	90	ml	\N	\N	t	\N
eede2f70-d8e6-4150-ab32-7c1c59e9414f	MÀU NHUỘM BÁN BỀN 4NT NEUTRAL BROWN 90ML	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP848456	90	ml	\N	\N	t	\N
30c2bb31-d2e0-44c2-b6ec-2c4fb2358d54	MÀU NHUỘM BÁN BỀN PRAVANA 5NT LIGHT NEUTRAL BROWN 90ML 2884008	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438389789	90	ml	\N	\N	t	\N
b6db9d09-9504-4757-a17d-ff24fe8e0ab8	MÀU NHUỘM BÁN BỀN PRAVANA PLATINUM SMOKE 90ML	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP848460	90	ml	\N	\N	t	\N
0f9b0c03-eecb-48f5-a153-bc1b69ecf1f0	DẦU GỘI PURIFYING TRỊ GÀU 100ML / SP848897	CHĂM SÓC TÓC DAVINES	\N	Chai	\N	t	159000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 8004608236597	100	ml	\N	\N	t	\N
32404bef-efc1-4d9e-bef9-4f22755799cc	KEM TẨY PRAVANA NÂNG SÁNG 9 CẤP ĐỘ 250ML	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP850433	250	ml	\N	\N	t	\N
246ebc53-e204-457f-a859-a5e3ef8fdae6	KEM TẠO KIỂU AMOS PRO STYLE FREEZE WAS 110ML	TẠO KIỂU AMOS	\N	Tuýp	\N	t	529000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8801675607875	110	ml	\N	\N	t	\N
56240cf4-8cd8-4661-b1f9-596ee34798a8	THUỐC NHUỘM MILBOL B6-NB	Kỹ Thuật Milbon	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP851116	100	ml	\N	\N	t	\N
7dd4c782-f2c6-459f-ad98-6159a25abffd	THUỐC NHUỘM MILBOL B8-NB	Kỹ Thuật Milbon	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP851117	\N	\N	\N	\N	t	\N
74fec172-1513-492c-8753-5bfd87f2fa20	DẦU DƯỠNG DAVINES OI OiL 135ML	CHĂM SÓC TÓC DAVINES	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: SP851787	135	ml	\N	\N	t	\N
8ebd8aba-574c-41a0-b78c-008d196c786a	SÁP EXTREME HOLD POMADE - 35G	CHĂM SÓC TÓC DAVINES	\N	Hũ	\N	t	291000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 008303	\N	\N	\N	\N	t	\N
6ce97652-bb38-4bad-9f8a-1c0e8f63bcb3	MẶT NẠ BAO CHÂN HÀN	SP NAIL	\N	Cái	\N	t	280000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP853048	\N	\N	\N	\N	t	\N
7cf4a8c5-afec-499c-8876-b7abb79a78f6	MẶT NẠ BAO TAY HÀN	SP NAIL	\N	Cái	\N	t	260000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP853049	\N	\N	\N	\N	t	\N
0fc7c41b-cab0-497c-b0bc-4d6cdfb1c44f	DẦU GỘI TÍM COLOR BALANCE PURPLE 1000ML / 2620645	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1550000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469519267	1000	ml	\N	\N	t	\N
26a384c8-bb9b-4173-9b21-9b9c73e7e1ef	DẦU XẢ TÍM COLOR BALANCE PURPLE 1000ML / 2620647	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1550000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469519182	1000	ml	\N	\N	t	\N
e5407367-ca08-41b0-91fe-563b93c331f1	XỊT CHỐNG NHIỆT  237ML - CHI VIBES KNOW	CHĂM SÓC CHI	\N	Chai	\N	t	803000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 633911826997	\N	\N	\N	\N	t	\N
c954b0b5-3c26-45cd-8c80-b60b99c18d34	MÁY XẤY PROBARBERS -607	MÁY KẸP	\N	Cái	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP855609	\N	\N	\N	\N	t	\N
79b756fa-2194-4862-be0c-97b613f829d5	KEO XỊT BÓNG TÓC OSIS+ 300ML	CHĂM SÓC  Schwarzkopf	\N	Chai	\N	t	390000	0	\N	\N	\N	\N	Thương hiệu: Schwarzkopf\nSKU: 4045787815917	300	ml	\N	\N	t	\N
9b9d92e8-adbb-40f7-94e3-f7b87ccac46c	Dầu xả tím THE PERFECT BLONDE 325ML	CHĂM SÓC PRAVANA	\N	Chai	\N	t	530000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438385293	325	ml	\N	\N	t	\N
88903209-d4c0-4efa-b595-f532c08a93a5	Dầu gội tím THE PERFECT BLONDE 325ML	CHĂM SÓC PRAVANA	\N	Chai	\N	t	530000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 750143385286	325	ml	\N	\N	t	\N
02ba08c3-96e2-4c9d-badf-6d436f0b8467	Dầu xả chăm sóc tóc COLOR CARE PROTECT 325ML	CHĂM SÓC PRAVANA	\N	Chai	\N	t	530000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438387723	325	ml	\N	\N	t	\N
5255ee11-4404-401f-bad6-2431fa81d689	Dầu  gội sóc tóc COLOR CARE PROTECT 325ML	CHĂM SÓC PRAVANA	\N	Chai	\N	t	530000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438387686	325	ml	\N	\N	t	\N
bc5e5229-6a30-46a0-b4bd-765b8b8a9c98	Dầu xả phục hồi độ ẩm INTENSE THERAPY 325ML	CHĂM SÓC PRAVANA	\N	Chai	\N	t	530000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438387266	325	ml	\N	\N	t	\N
43cc3ba2-35d1-4228-9f89-bb23302ca2ad	Dầu gội phục hồi độ ẩm INTENSE THERAPY 325ml	CHĂM SÓC PRAVANA	\N	Chai	\N	t	530000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438387235	325	ml	\N	\N	t	\N
3621910e-e51e-4cf4-8064-c57304700bb6	Dầu gội bảo vệ màu PURIFY & REVIVE 325ML	CHĂM SÓC PRAVANA	\N	Chai	\N	t	530000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438388553	325	ml	\N	\N	t	\N
0244d5a0-4d34-4faa-8b6c-f739ec3d42b2	Dầu gội thuần chay  DAILY CLEANSE 295ML	CHĂM SÓC PRAVANA	\N	Chai	\N	t	720000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438388911	295	ml	\N	\N	t	\N
3cc96655-7d8e-4753-9b01-3ef8ea58b3d8	Dầu gội thuần chay TRUITY DAILY 251ML	CHĂM SÓC PRAVANA	\N	Chai	\N	t	720000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438388928	251	ml	\N	\N	t	\N
7e3e77b5-648b-4ac2-8467-3e37687b90a2	Kem sấy tóc nhiệt TRUITY 118ML	CHĂM SÓC PRAVANA	\N	Chai	\N	t	590000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438388935	118	ml	\N	\N	t	\N
9312382f-aa13-4bca-a20e-ad467fe985e7	Mặt nạ tóc THE PERFECT BLONDE 147ML	CHĂM SÓC PRAVANA	\N	Tuýp	\N	t	530000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438387945	147	ml	\N	\N	t	\N
1581a350-37e9-48dc-bf6b-df0084998bf8	Mặt nạ tóc INTENSE THERAPY 147ML	CHĂM SÓC PRAVANA	\N	Tuýp	\N	t	530000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438387297	147	ml	\N	\N	t	\N
7a3b4254-b4fc-4a26-be1d-ddce86470bba	Xịt dưỡng ẩm đa năng INTENSE THERAPY 298ML	CHĂM SÓC PRAVANA	\N	Chai	\N	t	530000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438384050	298	ml	\N	\N	t	\N
8ed3017e-c064-406b-b069-88ef53add20d	Xịt dưỡng phục hồi THE PERFECT BLONDE 298ML	CHĂM SÓC PRAVANA	\N	Chai	\N	t	530000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438385309	298	ml	\N	\N	t	\N
22fe6103-c959-4f94-ada8-a87a5b843d53	Dầu gội dưỡng ẩm INTENSE THERAPY 1000ML	CHĂM SÓC PRAVANA	\N	Chai	\N	t	1080000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438387242	1000	ml	\N	\N	t	\N
57c6fa6c-c2e4-4f76-bc7d-5780ee9a4fbc	Dầu xả dưỡng ẩm INTENSE THERAPY 1000ML	CHĂM SÓC PRAVANA	\N	Chai	\N	t	1080000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438387273	1000	ml	\N	\N	t	\N
64a40340-9bdf-4002-bc04-563ffc046f86	Dầu xả tóc nhuộm THE PERFECT BLONDE 1000ML	CHĂM SÓC PRAVANA	\N	Chai	\N	t	1080000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438385392	1000	ml	\N	\N	t	\N
3224a6bc-a958-4da7-89b7-8bd232950eac	Dầu xả bền màu COLOR PROTECT 1000ML	CHĂM SÓC PRAVANA	\N	Chai	\N	t	1080000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438387730	1000	ml	\N	\N	t	\N
a27ab6a7-c0e9-4822-902e-921b76adf3a5	Dầu gội bền màu COLOR PROTECT 1000ML	CHĂM SÓC PRAVANA	\N	Chai	\N	t	1080000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438387693	1000	ml	\N	\N	t	\N
01ef60cc-c471-439e-861a-089688ac5368	MÀU NHUỘM PRAVANA 7.64/7RC RED	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP857762	100	ml	\N	\N	t	\N
7de23b2f-9c3e-4243-b80a-eadcf9ae2609	MÀU NHUỘM MILBON 9-55	Kỹ Thuật Milbon	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP858342	\N	\N	\N	\N	t	\N
ccca1f87-4e67-4293-8553-516b29f9c1ab	MÀU NHUỘM MILBON 13-55	Kỹ Thuật Milbon	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP858343	\N	\N	\N	\N	t	\N
9944a2c9-5857-40d2-95f5-07450d403790	OXY MILBON 20VOL 6%	Kỹ Thuật Milbon	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP858344	\N	\N	\N	\N	t	\N
f489db27-fd37-4ba5-a5a0-ea915be96fec	MÀU NHUỘM RG VERDE	KỸ THUẬT RG	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP864282	\N	\N	\N	\N	t	\N
d1b4deb4-74de-4da4-bbe5-894877c2c0f1	GEL WAS TẠO KIỂU AMOS 300ML	TẠO KIỂU AMOS	\N	Tuýp	\N	t	379000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8801675603266	300	ml	\N	\N	t	\N
3dfd55fe-0e0b-4cde-a93a-e1042a4c4590	MÁY KẸP GLAMPALM (SIZE LỚN)	MÁY SẤY, KẸP GLAMPALM	\N	Cái	\N	t	5590000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: GP501	\N	\N	\N	\N	t	\N
0568fe17-4058-43b9-8943-6c18fc7eb9a9	KEO XỊT TẠO KIỂU JOIMIST MEDIUM 300ML / 2620776	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	590000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469523233	300	ml	\N	\N	t	\N
a7b2dab2-11ce-416b-b896-7d9b243dba7f	MOUSSE TĂNG ĐỘ PHỒNG GIỮ NẾP CỨNG 9+ 300MLa / 2620791	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	590000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469523264	300	ml	\N	\N	t	\N
21355c55-ea6e-4174-be65-a41063776799	XỊT BẢO VỆ MÀU DEFY DAMAGE IN A FLASH 7S 200ML / 2939535	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	880000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469562355	200	ml	\N	\N	t	\N
cc0f2060-fa38-4536-8b85-7cfafbbdef3f	XỊT BẢO VỆ MÀU INNERJOI PRESERVE 200ML/ 2756492	CHĂM SÓC JOICO INNERJOI	\N	Chai	\N	t	650000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469525008	200	ml	\N	\N	t	\N
bb2ab4e2-3efe-4de3-9778-c1a360183e00	DẦU XẢ COLOR FUL ANTI_FADE 250ML / 2895754	CHĂM SÓC TÓC JOICO	\N	Tuýp	\N	t	620000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469532167	250	ml	\N	\N	t	\N
0d9b5568-ff58-42f2-81ce-fdc8f412af7f	DẦU GỘI COLOR FUL ANTI-FADE 1000ML / 2631705	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1550000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469517072	1000	ml	\N	\N	t	\N
0772df4f-0858-4493-97ed-d59bf5571f18	DẦU XẢ COLOR FUL ANTI-FADE 1000ML / 2894881	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1550000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469532518	1000	ml	\N	\N	t	\N
225ac957-20c2-4359-9fdf-f17e49af261f	UỐN NÓNG PLEXIS 5.0	KỸ THUẬT PLEXIS	\N	Túi	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP870274	\N	\N	\N	\N	t	\N
616672ad-d0b7-42f6-a2e7-c9af73092b25	UỐN NÓNG PLEXIS 6.0	KỸ THUẬT PLEXIS	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP870276	\N	\N	\N	\N	t	\N
2c812f11-5158-4241-b2fd-60bb99a173a2	UỐN NÓNG PLEXIS  7.0	KỸ THUẬT PLEXIS	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP870278	\N	\N	\N	\N	t	\N
1d9d521e-f188-4b68-a949-ae84e029faea	UỐN NÓNG PLEXIS  8.0	KỸ THUẬT PLEXIS	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP870279	\N	\N	\N	\N	t	\N
45d28f23-eadb-4917-81fa-504f0b78cb2e	UỐN NÓNG PLEXIS  9.0	KỸ THUẬT PLEXIS	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP870280	\N	\N	\N	\N	t	\N
ffc613d4-dd4e-41bd-b6c1-14bed8f20b12	AMPOULE BẢO VỆ SỢI TÓC 15ml (hồng)	AMPOULE	\N	Ống	\N	t	310000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: AMPOULE HỒNG	15	ml	\N	\N	t	\N
a48acafd-8beb-467f-b47b-15ef1d950b2f	AMPOULE BẢO VỆ DA ĐẦU 15ML (xanh)	AMPOULE	\N	Ống	\N	t	310000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: AMPOULE XANH	15	ml	\N	\N	t	\N
d1649b4d-a870-489c-843d-dfc217e8c6d1	DẦU GỘI COLORFUL ANTI - FADE 300ML / 2631704	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	620000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469517973	300	ml	\N	\N	t	\N
e4e0e577-96b1-4a3c-bcb1-a1d7e3c86ee1	máy uốn sóng	MÁY KẸP	\N	Chai	\N	t	680000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP873859	\N	\N	\N	\N	t	\N
a7e58f15-40cc-49c2-adf1-d267bee5f2a6	GỘI OLAPLEX 4C 250ML	CHĂM SÓC OLAPLEX	\N	Chai	\N	t	750000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 02468	\N	\N	\N	\N	t	\N
e3414ee8-5111-4ba0-8e47-5a60c1119fa0	HẤP DẦU NARAXIS TRUNG TÍNH DÀNH CHO DA ĐẦU 500ML	CHĂM SÓC NARAXIS	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8033064400044	500	ml	\N	\N	t	\N
6e18f1c5-b847-4387-a443-511e16b73f8f	CALECIM TẾ BÀO GỐC LIỆU TRÌNH 1 HỘP/6 LỌ	CALECIM	\N	Hộp	\N	t	12000000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP878892	\N	\N	\N	\N	t	\N
cad44a8f-f493-4aaa-81f8-8598ac00bc87	MOUSSE TĂNG ĐỘ PHỒNG GIỮ NẾP CỨNG 7+ 300ML / 2620773	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	590000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469523219	\N	\N	\N	\N	t	\N
b190dc99-d825-4dfc-a73c-52b798a3b05e	N. STYLING SERUM 94G	CTY TNHH XNK&TM AN PHUONG	\N	Chai	\N	t	600000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 4540688145359	\N	\N	\N	\N	t	\N
64d121e1-23e9-433e-81d1-701836f3c0a2	ỐNG NHUỘM GOLDWELL TC 6RB 250ML	KỸ THUẬT GOLDWEL	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP882331	\N	\N	\N	\N	t	\N
5968ae5e-0156-48f1-a409-c8967730956f	ỐNG NHUỘM GOLDWELL TC 7RB 250ML	KỸ THUẬT GOLDWEL	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP882332	\N	\N	\N	\N	t	\N
77ad4eb7-2070-4b42-bade-81d4f8af6b46	KEM NHUỘM JOICO K-PAK 7B	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP884522	\N	\N	\N	\N	t	\N
9c1b4027-8444-41fb-a62a-c67eb1d42362	KEM NHUOM JOICO VERO 7BA	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP884523	\N	\N	\N	\N	t	\N
edff3144-b6e7-48e1-922e-61364fa177b6	MÀU NHUỘM BỀN PRAVANA ASH	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP884524	\N	\N	\N	\N	t	\N
3e3bc515-2aa7-4c41-8422-5a6bbe9e93bf	MÀU NHUỘM BỀN PRAVANA 9.3 /9G	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP884525	\N	\N	\N	\N	t	\N
582b0b79-3b4b-4120-baf2-60d88ad6667e	MÀU NHUỘM BỀN PRAVANA 8.3 /8G	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP884526	\N	\N	\N	\N	t	\N
f2a326b5-ebb0-49c2-9840-9743376a7052	MÀU NHUỘM BỀN PRAVANA 000 LIGHTENING BOOSTER	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438381165	\N	\N	\N	\N	t	\N
e1be1bc1-c1dd-4327-9a23-42cbdf96b365	MÀU NHUỘM GEL BÁN BỀN PRAVANA8 8NT 2884005	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438389758	\N	\N	\N	\N	t	\N
1544383f-4145-4546-8c90-0846e4e7f5c9	MÀU NHUỘM GEL BÁN BỀN PRAVANA 7NT 2884006	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438389765	\N	\N	\N	\N	t	\N
b4e5bb81-b25a-465a-9f0b-5087369f96cd	COMBO JOICO NAM TẾT	PHỤ THU TẾT COMBO JOICO	\N	Chai	\N	t	220000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: CBJNT	\N	\N	\N	\N	t	\N
8735ebc8-c1ff-4243-b7df-c5467a0ebb21	COMBO JOICO NỮ NGẮN TẾT 2025	PHỤ THU TẾT COMBO JOICO	\N	Chai	\N	t	270000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: CBJNT	\N	\N	\N	\N	t	\N
cb3afe32-266d-4f08-95b5-8d8b25bf8c0a	COMBO JOICO NỮ DÀI TẾT 2025	PHỤ THU TẾT COMBO JOICO	\N	Chai	\N	t	320000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: CBDT	\N	\N	\N	\N	t	\N
9f3a7699-5ac8-4afc-b228-49718961faa2	SÁP RED POMADE HIGH SHEEN 340G	CHĂM SÓC TÓC DAVINES	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 869519000006	\N	\N	\N	\N	t	\N
03ab8441-64ea-49b1-94d0-6a9f1f85fbf9	UỐN LẠNH  PLEXIS N	KỸ THUẬT PLEXIS	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP889437	\N	\N	\N	\N	t	\N
c1779d7b-1a04-4a5a-b0b6-54a96152aead	UỐN LẠNH  PLEXIS H	KỸ THUẬT PLEXIS	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP889438	\N	\N	\N	\N	t	\N
7636b779-7f83-4df2-b077-04b8ab277dba	UỐN LẠNH  PLEXIS S	KỸ THUẬT PLEXIS	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP889439	\N	\N	\N	\N	t	\N
50eeb6fb-7d7c-4422-9f64-9948bebe2ba8	UỐN LẠNH  PLEXIS SS	KỸ THUẬT PLEXIS	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP889440	\N	\N	\N	\N	t	\N
80526d42-980d-4f3d-95b1-44d9d214bdd8	DẬP LẠNH PLEXIS SỐ 2	KỸ THUẬT PLEXIS	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 809964790000	\N	\N	\N	\N	t	\N
fd7cad21-603c-46a6-ad6b-9a4fc5fc0ca3	BOOSTER KÍCH UỐN PLEXIS S1	KỸ THUẬT PLEXIS	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP889452	\N	\N	\N	\N	t	\N
6d5bed16-b26c-458b-af3b-bac3be216bcf	DẬP NÓNG NEUTRALIZER PLEXIS  SỐ 2	KỸ THUẬT PLEXIS	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP889454	\N	\N	\N	\N	t	\N
64a68263-33eb-4752-bb95-b4b1a10518bc	UỐN NÓNG PLEXIS 9.5	KỸ THUẬT PLEXIS	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP889520	\N	\N	\N	\N	t	\N
6a2d107c-ce72-4a21-a905-d54172f879f0	ÉP SIDE PLEXIS H	KỸ THUẬT PLEXIS	\N	Túi	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP889521	500	ml	\N	\N	t	\N
be674c80-27d1-432d-8f2f-bfe19310219b	ÉP SIDE PLEXIS S	KỸ THUẬT PLEXIS	\N	Túi	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP889522	500	ml	\N	\N	t	\N
c21b678e-01a1-43c8-9b4e-7f40df238af4	ÉP SIDE PLEXIS N	KỸ THUẬT PLEXIS	\N	Túi	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP889523	500	ml	\N	\N	t	\N
d23fd298-fe7d-4248-81ca-4c0ecba2bc80	PHỤC HỒI TREATMENT PLEXIS	KỸ THUẬT PLEXIS	\N	Chai	\N	t	790000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP889524	\N	\N	\N	\N	t	\N
1d18c337-60a3-49fd-badc-6de8db70f791	UỐN NÓNG PLEXIS EX	KỸ THUẬT PLEXIS	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP889525	\N	\N	\N	\N	t	\N
ad3e4689-7605-4043-aa8d-442ec0d458ae	MẶT NẠ  SKIN GLOW MASK 100ML	SẢN PHẨM LÀM ĐẸP	\N	Chai	\N	t	1290000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8809693360468	\N	\N	\N	\N	t	\N
a06f0754-ed5e-4a45-89a7-570e52903c00	Máy sấy Babyliss Pro Rapido 2200w	MÁY KẸP	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP895502	\N	\N	\N	\N	t	\N
738b2836-73bb-409c-b45b-ffd3583f658a	MÀU NHUỘM BỀN PRAVANA 9.12/9ABV  90ML	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP898776	\N	\N	\N	\N	t	\N
27881649-7f29-4ac9-b409-4751eecbdd18	MÀU NHUỘM INTENSITY RED 118ML	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP898782	\N	\N	\N	\N	t	\N
35a57c3e-9821-4dde-ac22-9f7627df9fdd	MẶT NẠ TÓC KBOND20 150ML / 2939869	CHĂM SÓC TÓC JOICO	\N	Tuýp	\N	t	880000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469562430	150	ml	\N	\N	t	\N
fc182a83-1282-4b71-890c-e66cd7c68e75	KEM DƯƠNG CHỐNG NHIỆT DREAM BLOWOVL YOUTHLOCK 177ML / 2729167	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	560000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469524940	177	ml	\N	\N	t	\N
22193288-c4da-495b-84c2-ff7ef1aec752	CẶP BÓC MÀU A+B	Cty TNG	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP903770	500	ml	\N	\N	t	\N
aa20b357-6d5e-4895-b38c-b438d6f341cc	XỊT DƯỠNG ẨM BLONDE LIFE 200ML / 2904213	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	730000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469558853	\N	\N	\N	\N	t	\N
385a5dd0-d397-4f99-b5b0-4946b88fb4bf	Xịt dưỡng Biotera ANTI FRIZZ 237ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7446954813	\N	\N	\N	\N	t	\N
7a2ea577-d11c-4f63-b55d-ccb079bed19e	MOUSSE TẠO KIỂU BIOTERA KHÔNG CHỨA CỒN 250ML / SP905193	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469548335	\N	\N	\N	\N	t	\N
b9ae039c-a3fa-46c3-b269-53480a50fd7f	DẦU GỘI DEFY DAMAGE DETOX 300ML / 2938339	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	620000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469562126	\N	\N	\N	\N	t	\N
9b74069d-1ce7-4829-a2e5-fe5cc2f9e135	CÀI TÓC	PHỤ KIỆN	\N	Chai	\N	t	200000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP907191	\N	\N	\N	\N	t	\N
92a19eb4-97dc-476a-b101-75841d096cee	XỊT DƯỠNG BẢO VỆ MÀU LIÊN KẾT DEFY DAMAGE PRO 1 160ML / J16005	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469509206	\N	\N	\N	\N	t	\N
29d78883-37f2-4e6d-b008-fbc289b09a0c	KBOND 20 JOICO 500ML / 2973015	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1950000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469568043	500	ml	\N	\N	t	\N
fba26079-4dfb-4c17-b8c2-1be8b4b5bdf0	TẠO KIỂU HAIR STICK 73G	CHĂM SÓC TIGI	\N	Lọ	\N	t	761000	0	\N	\N	\N	\N	Thương hiệu: TIGI\nSKU: 615908403718	\N	\N	\N	\N	t	\N
bef30ee9-e2ba-4048-917e-f75444cdf009	MẶT NẠ NUÔI DƯỠNG DA ĐẦU KERASTASE 200ML	CHĂM SÓC KERASTASE	\N	Hũ	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: SP921936	\N	\N	\N	\N	t	\N
3d5367d2-12bd-4340-b771-29a97981e5c1	DẦU GỘI DETOXIFYING GIẢI ĐỘC THANH LỌC 1000ML / SP930689	CHĂM SÓC TÓC DAVINES	\N	Chai	\N	t	1158000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8004608256663	1000	ml	\N	\N	t	\N
9e2f8ce6-4973-40a7-a3a7-d5c6d0f649ca	peeling da đầu Kerastase 500ml	CHĂM SÓC KERASTASE	\N	Chai	\N	t	2160000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474637136277	\N	\N	\N	\N	t	\N
69f0eeba-8d74-454e-9e41-e778c92aec36	peeling da đầu Kerastase 200ml / 157890	CHĂM SÓC KERASTASE	\N	Tuýp	\N	t	1100000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 6932313114751	200	ml	\N	\N	t	\N
19268599-d3af-4f6e-b3bc-c27e9f01a6c5	Mặt nạ Miracle Hair Mask -517.5ml	CHĂM SÓC TÓC DAVINES	\N	Chai	\N	t	1359000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP930931	\N	\N	\N	\N	t	\N
7b649b07-e233-4af4-bbef-6f2e820272ff	DẦU GỘI DEFY DAMAGE DETOX - 1L / 2938338	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1550000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469562065	\N	\N	\N	\N	t	\N
702e93d0-5d4d-4b5f-b06e-4cf0400b5350	AVEDA SHOPPING BAG SMALL ( túi nhỏ)	KỸ THUẬT AVEDA	\N	Cái	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 018084919125	\N	\N	\N	\N	t	\N
12a8edc0-da46-4a56-b8f2-a7bb68ec21f3	AVEDA SHOPPING BAG LARGE ( túi lớn)	KỸ THUẬT AVEDA	\N	Cái	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 018084919132	\N	\N	\N	\N	t	\N
5e93c83a-aefa-45e3-8b46-9a6467c749ee	AVEDA LITER PUMP ( vòi aveda)	KỸ THUẬT AVEDA	\N	Cái	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 018084926925	\N	\N	\N	\N	t	\N
609f7994-be3a-404e-bb68-2adb3adc1531	Màu Nhuôm Topchic 7RR - 250ml-N	KỸ THUẬT GOLDWEL	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609003908	250	ml	\N	\N	t	\N
5cbcd3a3-9f49-415b-a0ad-7c309aef75d0	MUSK 0/00	A HẢI	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP932440	\N	\N	\N	\N	t	\N
9ed92a83-eb38-41b8-8970-f60601463cbc	Màu nhuộm Ordeve 7-55	Kỹ Thuật Milbon	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP932509	\N	\N	\N	\N	t	\N
a733d6fb-d9c1-48d4-83e2-1e7c8f2c906d	ICED GRAPES BATH SALT	VASELINE	\N	Hộp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: L'Oréal Paris\nSKU: 312804	\N	\N	\N	\N	t	\N
d9530e04-be75-4bad-9db9-a5d1cd08deac	PLEXIS PPT	KỸ THUẬT PLEXIS	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP932811	\N	\N	\N	\N	t	\N
ef9bb5ac-b7cc-42d8-9750-972ad2cfe5b5	PRAVANA 9.4/9C	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP932813	\N	\N	\N	\N	t	\N
d211f2c9-fe2b-4efc-b72a-8ea0dbdec767	Bột Tẩy Ordeve Addicthy Tint Clear - 500g	Kỹ Thuật Milbon	\N	Hộp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP933198	\N	\N	\N	\N	t	\N
e17db423-7456-4dfe-a19e-86dc00d00e97	Màu nhuộm bền PRAVANA 7.35/7Gm	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP933700	\N	\N	\N	\N	t	\N
a599cb2f-c8ab-42f5-b53c-b7540065f66d	Màu nhuộm bền Pravana 8.31/8Ga	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP933703	\N	\N	\N	\N	t	\N
8d5023c8-6586-4c46-a64e-82d6c5a446fe	Màu nhuộm bền PRavana 6.1/6A	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP933705	\N	\N	\N	\N	t	\N
70cadb50-7cf8-4ef2-819d-dfa0053e1b07	Màu nhuộm gel bán bền Pravana 8B LBL 2884015	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438389857	\N	\N	\N	\N	t	\N
29c0a76a-3194-4e66-a299-89d9d0aa29c3	Bột tẩy nâng sáng VEROLIGHT 900g	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP933709	\N	\N	\N	\N	t	\N
92585fcb-cc4b-49a1-b36b-a4e5e5c0ef4b	Dập kem Plexis C2	KỸ THUẬT PLEXIS	\N	Túi	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8809964790062	\N	\N	\N	\N	t	\N
3a77ca5d-e01f-481e-a2d1-1efcbe5c54fd	AROMASOUL MASSAGE OIL	[COMFORT ZONE]	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8004608503996	\N	\N	\N	\N	t	\N
5d653797-22fc-4a74-b3c0-50c8d6c435db	DƯỠNG CHẤT GIẢM RỤNG TÓC KERASTASE SPECIFIQUE INTENSE ANTI-THINNING CARE	CHĂM SÓC KERASTASE	\N	Hộp	\N	t	2200000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474636397556	\N	\N	\N	\N	t	\N
11ec5010-71bf-4196-8820-9df849b2bd20	DẦU GỘI GIẢM RỤNG TÓC KERASTASE SPECIFIQUE BAIN PRE'VENTION	CHĂM SÓC KERASTASE	\N	Chai	\N	t	3400000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474636397440	\N	\N	\N	\N	t	\N
bdf789a7-dc1d-4d63-a448-f7057751caec	DẦU GỘI AVEDA(salon)  COLOR CONTROL   1000ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	3535000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084037386\nHang salon	1000	ml	\N	\N	t	\N
70c30b38-2e4f-41c9-9019-de43c8232951	KEM DƯỠNG AVEDA BOTANICAL REPAIR  Light 350ml	CHĂM SÓC AVEDA	\N	Tuýp	\N	t	2785000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084019313	350	ml	\N	\N	t	\N
13802aae-cf49-49ff-b5a1-075ce75393fc	DẦU XÃ  AVEDA INVATI ULTRA LIGHT 200ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1225000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084054970	\N	\N	\N	\N	t	\N
18e66ebb-19fe-4816-bc08-d20368e9fba9	DẦU GỘI AVEDA GIẢM RỤNG TÓC INVATI ULTRA ADVANCED LIGHT 1000ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	4095000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084055038	\N	\N	\N	\N	t	\N
1f214e43-c12f-4cf9-ae52-79d54af73ad7	DẦU GỘI AVEDA INVATI ULTRA ADVANCED LIGHT 200ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	1055000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084055021	200	ml	\N	\N	t	\N
b1ef9765-5742-4cd8-a93b-3fc18a577ea1	SERUM AVEDA INVATI ULTRA ADVANCED 150ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	2380000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084060872	\N	\N	\N	\N	t	\N
f3862ce6-9203-402c-9d92-697d43e17dca	SERUM AVEDA INVATI ADVANCED 150ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	2380000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084977354	\N	\N	\N	\N	t	\N
54d067b6-8a78-41cb-be97-c41d82ab9ead	DẦU XẢ BIOTERA ANTI FRIZZ 237ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469548137	\N	\N	\N	\N	t	\N
4158d4d2-06d7-4eb5-8bb6-07a7e2b24114	Dầu gội Kerastase bảo vệ màu cho tóc nhuộm 80ml	CHĂM SÓC KERASTASE	\N	Chai	\N	t	350000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474637196851\nnull	80	ml	\N	\N	t	\N
a35426dc-a452-4461-a777-5b9a0f8dfcb4	Dầu gội Kerastase ngăn ngừa rụng tóc 80ml	CHĂM SÓC KERASTASE	\N	Chai	\N	t	350000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474637196554\nnull	80	ml	\N	\N	t	\N
23b598e0-6832-423e-9387-c7e7be2ca238	SÁP EXTREME HOLD POMADE REUZEL 35g	KHÁC	\N	Hũ	\N	t	273000	0	\N	\N	\N	\N	Thương hiệu: Davines\nSKU: 852968008303\nnull	\N	\N	\N	\N	t	\N
0fa4e2cb-461d-49f2-8f5a-608dbbd555ff	TINH DẦU DẠNG XỊT BIJOUROI LUSTER DRESS OIL 125G	KHÁC	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 4540688143720	\N	\N	\N	\N	t	\N
62e2f957-3d64-4ab4-aeb8-20e82bb1d19d	SERUM OLAPLEX NUÔI DƯỠNG BẢO VỆ TÓC CHUYÊN SÂU NO.9 90ML	CHĂM SÓC OLAPLEX	\N	Chai	\N	t	750000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 850018802284	\N	\N	\N	\N	t	\N
4b5ded58-e23f-48a7-a116-e11041a1470a	VASELINE HEALING JELLY 368G	VASELINE	\N	Hũ	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 305212345001	\N	\N	\N	\N	t	\N
50702b82-c5cb-4bfa-a3b7-bd6d33c79ff3	KHỬ MÙI NAIFASI 500G	Cty TNG	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 6971921979758	\N	\N	\N	\N	t	\N
b1a99c42-c75d-4313-a020-afa2fe20e05d	SỮA RỬA MẶT LYOLAN CUCUMBER 120G	KHÁC	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 6921570900207	\N	\N	\N	\N	t	\N
f5ede221-5295-43a1-9ded-208895006160	SỮA RỬA MẶT LYOLAN MILK 120G	KHÁC	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 6921570903451\nnull	\N	\N	\N	\N	t	\N
d8b7cb23-7a13-4a34-8abe-6c049ef7bdab	SỮA RỬA MẶT HAZELINE NGHỆ HOA CÚC 100G	KHÁC	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8934868166573\nnull	\N	\N	\N	\N	t	\N
05e78ee7-91e8-465f-8e54-9739737cd939	GEL RỬA MẶT HAZELINE TRÀM TRÀ CICA 100G	KHÁC	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8934868183181\nnull	\N	\N	\N	\N	t	\N
48def7e8-fd1c-40a3-ac63-211ff42e6717	JOHNSON'S BABY OIL 200ML	KHÁC	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8850007060321	\N	\N	\N	\N	t	\N
82065f91-419f-4100-842b-3fa95d2ea3bf	SỮA DƯỞNG THỂ PHỤC HỒI DA VASELINE 725ML	KHÁC	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8901030912955	\N	\N	\N	\N	t	\N
b931ee16-ff03-4628-ab86-cbd4950a2b6a	MẶT NẠ SULWHASOO 18G	KHÁC	\N	Gói	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8809803521376	\N	\N	\N	\N	t	\N
36578b39-19a0-44da-bcd2-ab5839057cf8	MẶT NẠ OHUI THE FIRST GENITURE 20ML	KHÁC	\N	Gói	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8801051352979	\N	\N	\N	\N	t	\N
fd99665b-b5f6-4ee5-95d4-b6bdf590bc8b	MẶT NẠ TẾ BÀO GỐC COCONUT 30G	KHÁC	\N	Gói	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8809008590924	\N	\N	\N	\N	t	\N
2c60fb4e-3695-4c3a-b2bb-7acdc6c7e399	DORADO CREAM AV	KỸ THUẬT DORADO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684009834	\N	\N	\N	\N	t	\N
9802ccfb-18ac-4d59-b553-2f999dd374bd	THUỐC NHUỘM AVEDA DARK V/R 28G	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084033227\nnull	\N	\N	\N	\N	t	\N
78e2dc7c-cadc-4e9c-a769-580af47e5ed2	THUỐC NHUỘM AVEDA LIGHT B/B 28G	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084033258\nnull	\N	\N	\N	\N	t	\N
9b68a925-0fde-429f-b992-033f54b48c3e	THUỐC NHUỘM AVEDA DARK B/G 28G	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084033180\nnull	\N	\N	\N	\N	t	\N
98b2f9d3-2353-4c49-b5c7-1f2b62b172d1	THUỐC NHUỘM AVEDA PURE G 28G	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084033357\nnull	\N	\N	\N	\N	t	\N
15228291-3bb3-4ebb-9be4-125ac47e37a0	THUỐC NHUỘM AVEDA DARK B/V 28G	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084033197\nnull	\N	\N	\N	\N	t	\N
8802858d-6755-4b96-8214-c86e61cbc3e1	THUỐC NHUỘM AVEDA PURE R 28G	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084033326\nnull	\N	\N	\N	\N	t	\N
12152fe4-f459-4c7f-b1d1-0f2e66ca3783	THUỐC NHUỘM AVEDA PASTEL V 28G	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084035740\nnull	\N	\N	\N	\N	t	\N
b9707abc-c2f1-4c20-94a6-f8852191cfb4	THUỐC NHUỘM JOICO QT SILVER	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469511261	\N	\N	\N	\N	t	\N
5f8b9403-2e09-4edf-a1a1-9f584dd071e8	THUỐC NHUỘM JOICO QT VIOLET	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469511278\nnull	\N	\N	\N	\N	t	\N
8fedd938-2b90-4d04-a3d0-e9f2a3378a45	THUỐC NHUỘM JOICO QT SAND	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469511254\nnull	\N	\N	\N	\N	t	\N
98fae3dd-3f55-45f5-b601-061914f6b9d3	MÀU NHUỘM BỀN PRAVANA 6N	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438380403	\N	\N	\N	\N	t	\N
251aa085-25ad-4c2b-b141-70f9703c97b5	Màu nhuộm bền 7.3/7g GoldenBlonde 90ml	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438380809	\N	\N	\N	\N	t	\N
ff5dd0b1-8284-45c6-a925-e78ac82552b6	MÀU NHUỘM BÁN BỀN PRAVANA 9G 2998754	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438302849	\N	\N	\N	\N	t	\N
00aad063-b2f4-49bb-a97b-6d2baa97fa56	Màu nhuộm bền PRAVANA Hi lifts Champagne 90ml	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438388546	\N	\N	\N	\N	t	\N
5e4903a6-4192-40df-a1ec-1ac9a0a90d31	Màu nhuộm bền PRAVANA Hi lifts Cool Violet 90ml	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438388508\nnull	\N	\N	\N	\N	t	\N
037c53f7-879b-40fa-b850-a70310ae89b3	Màu nhuộm bền PRAVANA Hi lifts Pale Violet 90ml	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438388539\nnull	\N	\N	\N	\N	t	\N
0f0b2bc6-f452-454f-8b31-4ef5054f4fa7	Màu nhuộm bền PRAVANA Poison Berry 90ml	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438387846\nnull	\N	\N	\N	\N	t	\N
cdb57272-3f21-45c4-8845-42a44acae683	MÀU NHUỘM BỀN PRAVANA ASH BLUE 90ML	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438381189	\N	\N	\N	\N	t	\N
5a4e6092-e919-4a08-9099-e2e91b1b153d	MÀU NHUỘM BỀN PRAVANA ASH GREEN 90ML	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438381172\nnull	\N	\N	\N	\N	t	\N
b80543a9-7905-4088-b42e-07eca875e3b8	MÀU NHUỘM BỀN PRAVANA 5.4/5C 90ML / 2993109	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438302030\nnull	\N	\N	\N	\N	t	\N
028fab4a-7581-4067-a098-43db83d601be	MÀU NHUỘM BÁN BỀN PRAVANA 3R 90ML 2998753	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438302825	\N	\N	\N	\N	t	\N
37d134c0-e050-4a5b-a960-96bad2593847	MÀU NHUỘM TRỰC TIẾP PRAVANA WILD ORCHID 90ML	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438382711	\N	\N	\N	\N	t	\N
b90744fc-741c-40f9-8b4a-c2ccd3cf42ad	MÀU NHUỘM TRỰC TIẾP PRAVANA NEON BLUE	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438384364	\N	\N	\N	\N	t	\N
3f9d14e0-b096-4b8f-9e11-30d16afe9492	MÀU NHUỘM TRỰC TIẾP PRAVANA CLEAR PASTEL	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438382742	\N	\N	\N	\N	t	\N
f0b207e3-3902-4360-8705-2786d5ebefee	MÀU NHUỘM BỀN PRAVANA 7.62/7Rbv 90ml 381066	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438381066	\N	\N	\N	\N	t	\N
93017226-10ad-4747-841b-ff840db42693	MÀU NHUỘM BỀN PRAVANA 7.52/7Mbv 90ml 2505779	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438380762\nnull	\N	\N	\N	\N	t	\N
118d9731-d00a-4d8a-a552-c27e1f8989ae	MÀU NHUỘM BỀN PRAVANA 7.43/7Cg 90ml	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438380946\nnull	\N	\N	\N	\N	t	\N
82a80882-6e45-4d82-8aaf-54754f4b37ad	MÀU NHUỘM AVEDA PT-VIOLET 28GN	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 018084033364	\N	\N	\N	\N	t	\N
b4cbb62a-d228-444e-bb4c-cf54a4aa2a67	MÀU NHUỘM AVEDA PT-PINK 28GM	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 018084033371	\N	\N	\N	\N	t	\N
ed14ef2a-d14f-41a5-bc1c-0b185abf5a7a	DƯỠNG CHẤT CHUYÊN BIỆT DƯỠNG VÀ BẢO VỆ DA ĐẦU KERASTASE	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1800000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636954704	\N	\N	\N	\N	t	\N
27f3b190-cb53-4410-badf-40e3759cf6fe	DORADO CREAM 11C	KỸ THUẬT DORADO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684009193\nnull	100	ml	\N	\N	t	\N
ce349ed8-9372-4e8a-a7f5-81f501422d10	Dưỡng ẩm & định hình dành cho tóc xoăn	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	590000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7446956274	\N	\N	\N	\N	t	\N
36fa7bcc-1218-451f-afe6-b2eb5e8cb82b	SIRTU B ALT 400ML	KHÁC	\N	Túi	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8809146288523	\N	\N	\N	\N	t	\N
bff18c0a-703a-4436-a61d-7961f2c5bb98	SIRTU A 1000ML	KHÁC	\N	Túi	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8809146288561	\N	\N	\N	\N	t	\N
775c87a6-e14d-431a-8b63-af3f9f65dbac	Vòi Kerastase	CHĂM SÓC KERASTASE	\N	Cái	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 34746303399003	\N	\N	\N	\N	t	\N
13eb09f7-3353-49c7-9800-04151bc16f93	Màu nhuộm bền PRAVANA Hi lifts Violet Blue 90ml / 2589758	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438388515\nnull	\N	\N	\N	\N	t	\N
4491dbfa-b6aa-4224-a6b0-49cace02566c	DẦU TRỢ NHUỘM JOICO BLONDE LIFE 20 VOL 6% 946ML	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 2817359	\N	\N	\N	\N	t	\N
8ac2a6b5-b496-4afd-a286-c51eb6305f94	DẦU TRỢ NHUỘM JOICO BLONDE LIFE 5 VOL 1.5% 946ML	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 2817360\nnull	\N	\N	\N	\N	t	\N
9ab11b9e-af1f-4db8-9d87-3d968de67bb4	DẦU TRỢ NHUỘM JOICO BLONDE LIFE 40 VOL 12% 946ML	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 2817362\nnull	\N	\N	\N	\N	t	\N
1bf829cb-b869-4a6d-b954-94fb4db55d1f	Bột tẩy nâng sáng Blonde Life Powder Lightener 900g / 2822644	KỸ THUẬT JOICO	\N	Hộp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469543736	\N	\N	\N	\N	t	\N
41083462-ce8b-44ca-a79e-4aae886c9408	Newance by Topchic 7NB GOLDWELL	CHĂM SÓC GOLDWELL	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 021609023050	\N	\N	\N	\N	t	\N
0f1f51a4-06c0-4836-a778-03161868e623	XỊT DƯỠNG KERASTSE FLUIDI SPRAY 150ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1250000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474630655201	\N	\N	\N	\N	t	\N
56837d55-7964-47db-a513-9223b35b192d	DẦU GỘI KERASTASE  DA ĐẦU NHẠY CẢM	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1150000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474636397389	\N	\N	\N	\N	t	\N
8de41c84-0cf7-4bc8-96b6-e8f762f4303a	Dầu gội Kerastase cho da dầu	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1150000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474636954766	\N	\N	\N	\N	t	\N
7a2353da-c333-422f-aae7-b0d68858767a	DẦU GỘI KERASTASE TĂNG MẬT ĐỘ  TOC NAM 250ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1600000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474636404384	\N	\N	\N	\N	t	\N
b2ca7450-a672-421c-9c7b-e3cfaa77e115	MẶT NẠ ĐẤT SÉT KERASTASE CHO DA ĐẦU DẦU 500ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474636954674	\N	\N	\N	\N	t	\N
0df82467-41f3-48a8-a9c5-476b5e1268bf	DAU GOI KERASTASE CHO DA DAU DAU (DIVALENT) 1000ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474636954759	\N	\N	\N	\N	t	\N
368e2fed-fdd8-43d3-a7c6-d93d083e5d73	DẦU GỘI KERASTASE CHROMA ABSOLU GIỮ MÀU 250ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1150000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474637059002	\N	\N	\N	\N	t	\N
4d3eec7a-bfab-496b-98bd-c58c89a891d4	XỊT DƯỠNG KERASTASE BẢO VỆ TÓC NHUỘM  150ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1250000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474637059057	\N	\N	\N	\N	t	\N
bc229e3b-0cb4-417a-bf31-b06dd998867f	XỊT DƯỠNG KERASTSASE CHO TOC KHO 150ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1250000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474637155049	\N	\N	\N	\N	t	\N
ed0dd3bb-6495-41e8-a055-414962138394	Lumishine XLN	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: J15317	\N	\N	\N	\N	t	\N
2f7f5fae-1e0b-4168-83c4-598bd1a58527	THUỐC NHUỘM LUMISHINE YL PERM Crm 4NNG 74ML	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: J16374	\N	\N	\N	\N	t	\N
b3fbe546-d9ac-4316-93b7-2730265c1826	MÀU NHUỘM LUMISHINE XLA 74ML	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: J15316	\N	\N	\N	\N	t	\N
f83826ac-8db3-4f0d-a9d8-0994ddade951	JOICO color Intesity semi- permanen CLEAR MIXER 118ML	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: J132341\nnull	\N	\N	\N	\N	t	\N
676a2b4a-fe30-414f-8149-f9f47fa452bc	DẦU GỘI CHUYÊN NGHIỆP CAO CẤP KERASTASE PARIS	CHĂM SÓC KERASTASE	\N	Chai	\N	t	3200000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474636954759	\N	\N	\N	\N	t	\N
c3fbc949-f622-4f4f-b669-06c465d8c1a7	DẦU GỘI KERASTASE DENSITE 80ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	350000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474637196462	\N	\N	\N	\N	t	\N
3b37a3f4-c108-4317-b761-d83e4ae1737d	Màu nhuộm bền PRAVANA 5.45 / 5Cm Light Copper Mahogany Brown 90ml	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2505483\nnull	\N	\N	\N	\N	t	\N
8051fcac-2dea-4c82-94a0-bbd2d989da9b	MR-DẦU DƯỠNG OIL 15ML (tặng)	CHĂM SÓC TÓC Moroccanoil	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7290013627476	\N	\N	\N	\N	t	\N
ee0c1b49-bfc8-4954-bfae-0fc589cd547c	PLEXIS UỐN LẠNH N 1L	KỸ THUẬT PLEXIS	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8809964790017	\N	\N	\N	\N	t	\N
8c5d26b6-6599-4269-902d-3dac37c28761	PLEXIS DẬP LẠNH SỐ 2 1L	KỸ THUẬT PLEXIS	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8809964790017	\N	\N	\N	\N	t	\N
ded2fec9-1b9f-43a1-9717-19d6fb6c2692	2493549/J16182 Sản phẩm tạo kiểu JOIFULL VOL STYLER 100ml	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	560000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469512398	\N	\N	\N	\N	t	\N
010d941a-a1db-41df-862f-070e59282487	Kem Dưỡng Tóc GUERLAIN Abeille Royale Honey Bond Treatment 150ml	KHÁC	\N	Hộp	\N	t	3200000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3346470620766	\N	\N	\N	\N	t	\N
a2d0928b-c0f2-4984-8649-c01048dd287a	SÁP EXTREME HOLD POMADE REUZEL 95G	KHÁC	\N	Hộp	\N	t	545000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 850064164022	\N	\N	\N	\N	t	\N
c068fc6c-2700-49ce-9ea4-e0a299743d66	SÁP CLAY MATTE POMADE REUZEL 340G	KHÁC	\N	Hộp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 852578006850	\N	\N	\N	\N	t	\N
ab93b901-0200-49cd-8e03-fac7772cee81	TONER DƯỠNG ẨM CHO DA DERMALOGICA 473ML	KHÁC	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 666151520011	\N	\N	\N	\N	t	\N
2c6ff301-fd4d-487f-868b-d642be535263	SỮA RỬA MẶT LÀM SẠCH DA DERMALOGICA 946ML	KHÁC	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 666151510012	\N	\N	\N	\N	t	\N
6bba6a83-1858-4282-8324-8e2f56252031	Bao dưỡng Keratin Socks	KHÁC	\N	Túi	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 838347000496	\N	\N	\N	\N	t	\N
37a7c385-4aa0-447f-8152-018fc6a1eb97	PLEXIS UỐN LẠNH S 1L	KỸ THUẬT PLEXIS	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP953962	\N	\N	\N	\N	t	\N
10c6e572-4b79-4160-ad7e-7b150014d932	LÕI TINH DẦU DƯỠNG ELIXIR KERASTASE (vàng)	CHĂM SÓC KERASTASE	\N	Hộp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474637215149	\N	\N	\N	\N	t	\N
f1849675-f88c-4e3f-8d03-85a50b8e0ca0	BỘT TẨY NÂNG SÁNG BLONDE LIFE SILVERLIGHT 450G / 2907477	KỸ THUẬT JOICO	\N	Hũ	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469559461	\N	\N	\N	\N	t	\N
4880e230-f9ff-4a21-9cf1-472fa723f1a3	JOICO color Intesity semi- permanen PEACOCK GREEN 118ML	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469481250\nnull	\N	\N	\N	\N	t	\N
82f0b949-22b8-4afd-8848-29c39e526b7d	KEO XỊT OSIS+ GIỮ CỨNG TÓC 300ML	CHĂM SÓC  Schwarzkopf	\N	Chai	\N	t	420000	0	\N	\N	\N	\N	Thương hiệu: Schwarzkopf\nSKU: 4045787999426	\N	\N	\N	\N	t	\N
379469b9-55a8-4ee6-8d9d-75b5bfc7b6f9	WAX BỘT TẠO KIỂU TÓC OSIS+ 10G	CHĂM SÓC  Schwarzkopf	\N	Hũ	\N	t	420000	0	\N	\N	\N	\N	Thương hiệu: Schwarzkopf\nSKU: 4045787936094	\N	\N	\N	\N	t	\N
c273929b-a6f2-40ca-b08f-0cc6a3bd946e	Màu nhuộm bền Pravana 6.3/6G Dark Golden Blonde 90ml	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 2505490	\N	\N	\N	\N	t	\N
a8f1bd98-e709-4b00-9b9f-fa9f906bc3ae	Màu nhuộm bền Pravana 4.3/4G Golden Blonde 90ml	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 2505776\nnull	\N	\N	\N	\N	t	\N
ebc69c91-4a43-449a-8e3f-29703884551f	Màu nhuộm bền Pravana 5.3/5G Light Golden Brown 90ml	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 2505778\nnull	\N	\N	\N	\N	t	\N
8bb90504-7e21-4e33-885b-7e56f3ae694d	KEM NHUỘM JOICO K-PAK 10B	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2824666\nnull	\N	\N	\N	\N	t	\N
fcfd6269-4679-402b-bdae-535bdb1636e9	HẤP DẦU KERASTASE NUTRI DƯỠNG ẨM DÀNH CHO TÓC KHÔ	CHĂM SÓC KERASTASE	\N	Hũ	\N	t	3100000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474637155018	\N	\N	\N	\N	t	\N
09d53288-1cc9-42e4-ac0c-9d6849ac38dc	TẨY TẾ BÀO CHẾT PRO SCALP SCALER 150ML	KHÁC	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8801675607530	\N	\N	\N	\N	t	\N
ae494727-767f-4046-8c6e-45c8a0acfc1d	2943583 Gel định hình & khóa ẩm tóc xoăn Curls Like Us	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	590000	2	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP948701	\N	\N	\N	0	t	\N
d616bdc0-ebbb-41e4-8b31-9aa96dafc4de	DƯỠNG CHẤT KERASTASE CHĂM SÓC DA ĐẦU & GIẢM RỤNG TÓC 90ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1600000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636858002	90	ml	\N	\N	t	\N
45a89418-3c2a-4658-87c8-7b67cd6e7c67	ỐNG LÔ HÀN QUỐC SIZE TO	PHỤ KIỆN	\N	Cái	\N	t	60000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: ỐNG LÔ	\N	\N	\N	\N	t	\N
f5c0a591-545b-44a6-909b-0823dfe56369	DẦU GỘI KERASTASE CHỐNG RỤNG SPECIFIQUE 250ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1600000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636397433	250	ml	\N	\N	t	\N
439fc65c-63ef-4584-bacb-206980e77ad7	MR-KEM TẠO KIỂU DƯỠNG ẨM MOROCCANOIL 300ML	CHĂM SÓC TÓC Moroccanoil	\N	Chai	\N	t	761000	0	\N	\N	\N	\N	Thương hiệu: Moroccanoil\nSKU: 7290011521028	300	ml	\N	\N	t	\N
88e295e0-ed7d-4272-aca2-1f2eb05122f9	JC- DẦU GỘI PHỤC HỒI ĐỘ ẨM MOISTURE 1000ML / 2643045	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1250000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469513944	1000	ml	\N	\N	t	\N
0dd62463-d838-47cb-8b5c-39a7dfad5ce5	KEM DƯỠNG AVEDA NUTRI PLENISH DEEP 150ML	CHĂM SÓC AVEDA	\N	Tuýp	\N	t	1280000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084028506	150	ml	\N	\N	t	\N
9b648e71-2163-4159-ae26-a131a1fa9856	DẦU XẢ SHAMPURE 1000ML	CHĂM SÓC AVEDA	\N	Chai	\N	t	2700000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084998090	1000	ml	\N	\N	t	\N
7ed6b858-6185-4ee5-9720-ed8dbb5580f2	DẦU GỘI AVEDA NUTRI PLENISH LIGHT 1000ml	CHĂM SÓC AVEDA	\N	Chai	\N	t	3580000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084014332	1000	ml	\N	\N	t	\N
3c89572a-db2c-41bc-98b3-eb08858bf22b	KEM NHUỘM RIGHT 7.111	KỸ THUẬT RG	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055182690961	\N	\N	\N	\N	t	\N
75344f44-f9ad-4b5a-afc5-9cfb6b84d733	Màu nhuộm trực tiếp PRAVANA Too Cute Coral	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438382780	\N	\N	\N	\N	t	\N
4f74d668-aae7-432c-b729-fda84152069f	MÀU NHUỘM TRỰC TIẾP PRAVANA NEON ORANGE	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 7501438384395	\N	\N	\N	\N	t	\N
61f18c4d-d200-4326-a18f-ff8c49162f71	MẶT NẠ DƯỠNG CHẤT AVEDA CHO DA DẦU 150ML ko bán	CHĂM SÓC AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084029374	150	ml	\N	\N	t	\N
0d9f6376-f833-4eb3-9e82-73e54c05299b	DORADO CREAM 7N 100ML	KỸ THUẬT DORADO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 8055684009063	100	ml	\N	\N	t	\N
1d75ff19-5571-472c-9fa2-915f7efa9f1b	DẦU XẢ TĂNG ĐỘ PHỒNG CHO TÓC 300ML / 2493548	CHĂM SÓC TÓC JOICO	\N	Tuýp	\N	t	520000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469512367\nDẦU XẢ TĂNG ĐỘ PHỒNG CHO TÓC JoiFull Volumizing Conditioner 250ml	250	ml	\N	\N	t	\N
01ed501d-c808-4af9-8527-9291ced556ed	JOICO  KEM NHUỘM 9G LIGHT GOLDEN BLONDE	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721723	74	ml	\N	\N	t	\N
9a2480e6-e0c2-488a-9927-83d98c229e25	JOICO KEM NHUỘM 5NRM+	KỸ THUẬT JOICO	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: SP721812	\N	\N	\N	\N	t	\N
0b2f243a-4640-4409-973c-a56ef8608c01	TẨY TẾ BÀO CHẾT DA ĐẦU 650G ( FUSIO-SCRUB)	CHĂM SÓC KERASTASE	\N	Hũ	\N	t	4110000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 3474636756988	\N	\N	\N	\N	t	\N
5a1fc68e-e947-47a9-9cec-599072b96190	MÁY KẸP CERAMIC	MÁY KẸP	\N	Cái	\N	t	680000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP727385	\N	\N	\N	\N	t	\N
4db6445d-9a7e-4b48-89dd-7d88991bb9b2	DẦU XẢ CẤP ẨM MOISTURE RECOVERY 250ML / 2564535	CHĂM SÓC TÓC JOICO	\N	Tuýp	\N	t	520000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469513906	250	ml	\N	\N	t	\N
6bbc0a36-fae9-4563-9503-a47c14cd9aca	DẦU GỘI KRT GIÀU DƯỠNG CHẤT CẤP ẨM 1000ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	3200000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474637154929	\N	\N	\N	\N	t	\N
5c370ed5-bd05-4c46-939a-8cc83e6643a0	DẦU DƯỠNG PHỤC HỒI RECOVER TOUCH OIL 230ML	[COMFORT ZONE]	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608506393	230	ml	\N	\N	t	\N
29016938-8442-4da0-936e-6e7181f73b51	NƯỚC DƯỠNG LÀM DỊU DA REMEDY TONER 500ML	[COMFORT ZONE]	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Comfort Zone\nSKU: 8004608506348	500	ml	\N	\N	t	\N
fbff8f3a-1a06-4844-a095-11fb200ba8ec	Dầu xả Joico K-pak Color Therapy phục hồi giữ màu nhuộm 1000ml / J152522	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	1250000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469516488	1000	ml	\N	\N	t	\N
0468a4eb-8db5-47ae-a5d1-512c49522f9a	THUỐC NHUỘM B7-CB	Kỹ Thuật Milbon	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP762269	\N	\N	\N	\N	t	\N
3075980f-7cf5-4cf9-9f57-9c37d8e1ad70	KEM DƯỠNG ẨM CHO DA DẦU SIMPLY PURE 50ML	SP CHĂM SÓC DA K.B PURE	\N	Chai	\N	t	2088000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7290109253091	\N	\N	\N	\N	t	\N
b27c919c-1ffa-4482-b6fd-954c47909cea	SỮA RỬA MẶT K.P PURE TEA TREE SOAP 250ML	SP CHĂM SÓC DA K.B PURE	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7290109253039	\N	\N	\N	\N	t	\N
07f6eb6f-0603-4f0f-8fa0-61d2e1bdfe61	KEM TẠO KIỂU DÀNH CHO TÓC UỐN SOĂN CURL CONFIDENCE 177ML / 2787975	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	590000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469531436	177	ml	\N	\N	t	\N
b8297aac-e6c3-4353-8510-da4efadcf98a	OXY TRỢ NHUỘM LUMI10 22VOL	KỸ THUẬT JOICO	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 7446952519	946	ml	\N	\N	t	\N
ad805e58-2043-4c88-b110-d8e8a2153a10	Màu nhuộm trực tiếp PRAVANA Blissful Blue	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 2551731	\N	\N	\N	\N	t	\N
6acf6bfd-afb2-4013-9474-13ed3625b112	Màu nhuộm bán bền PRAVANA Express Tones Violet	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 7501438384845	\N	\N	\N	\N	t	\N
5c60f228-3dc7-4c2c-a497-3a581da17657	Màu nhuộm bán bền PRAVANA 5.92 / 5Sbv Light Smokey Beige 2800712	KỸ THUẬT PRAVANA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 7501438389277	\N	\N	\N	\N	t	\N
a93fc25d-313d-4520-b7c4-f5759a72ad7e	MÀU NHUỘM MG 9-pGG	KỸ THUẬT BOMANE	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP814344	\N	\N	\N	\N	t	\N
b7d8117c-bae8-4e8a-8130-c24dcb219121	MÀU NHUỘM MG 13-55	KỸ THUẬT BOMANE	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP814366	80	ml	\N	\N	t	\N
f4c535e1-dd3c-45cf-a343-381bbbf4aa4c	MÁY UỐN	KHÁC	\N	Cái	\N	t	4500000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP965708	\N	\N	\N	\N	t	\N
1f85d618-f3ae-4226-9f38-5e7e34e3d275	TẨY TẾ BÀO CHẾT DA ĐẦU AVEDA SCALP SOLUTIONS 150ML	CHĂM SÓC AVEDA	\N	Tuýp	\N	t	1470000	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084040508	\N	\N	\N	\N	t	\N
2c68545b-b228-470b-ae00-2d6b17c4682a	Bước 1 Aveda Botanical Repair 250ml	CHĂM SÓC AVEDA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084018590	\N	\N	\N	\N	t	\N
c7eed740-7432-4aea-a9fc-fccae506b94b	UỐN/ÉP Structure + shine Agent 1-0 400ml	KỸ THUẬT GOLDWEL	\N	Túi	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Goldwell\nSKU: 4021609031109	400	ml	\N	\N	t	\N
373453d9-2d1e-4757-90c4-7bfe0b4035b2	KEM TẨY TẾ BÀO CHẾT DA ĐẦU ( GÀU ) 200ML	CHĂM SÓC KERASTASE	\N	Tuýp	\N	t	4110000	0	\N	\N	\N	\N	Thương hiệu: Keratase\nSKU: 157890	500	ml	\N	\N	t	\N
9c5d3368-9d5f-4955-bd8e-68e7d25269cc	MẶT NẠ DÀNH CHO TÓC NHUỘM  KHỬ ĐỎ 150 ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	1400000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474637059095	\N	\N	\N	\N	t	\N
bbbf4ba4-01c0-4d49-a215-770e296c6b19	TINH CHẤT CÂN BẰNG BẢO VỆ MÀU VÀ PHỤC HỒI TÓC NHUỘM 210ML	CHĂM SÓC KERASTASE	\N	Chai	\N	t	2800000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474637059101	\N	\N	\N	\N	t	\N
c14e2a78-3004-4c82-9acd-1cd68ae30a20	DẦU XẢ BIOTERA COLOR CARE 1000ML	CHĂM SÓC TÓC BIOTERA	\N	Chai	\N	t	625000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469547550	1000	ml	\N	\N	t	\N
85438666-6e81-40ba-87b2-6165625eb912	MÀU NHUỘM DELL COLOR CREAM 7.35	KỸ THUẬT VŨ LỘC	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP851797	100	ml	\N	\N	t	\N
6c3a043d-a39c-4c9c-a122-4458dfe0cbc3	Dầu gội tóc nhuộm THE PERFECT BLONDE 1000ML	CHĂM SÓC PRAVANA	\N	Chai	\N	t	1080000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 7501438385408	1000	ml	\N	\N	t	\N
5420cb5c-1294-40fe-83a2-9aecda374c9f	TINH DẦU DƯỠNG DÀNH CHO TÓC TẨY 100ML / 2644386	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	560000	0	\N	\N	\N	\N	Thương hiệu: Joico\nSKU: 074469514385	100	ml	\N	\N	t	\N
4c200daa-7b0c-41c6-ab57-752b3c05540d	BOOTER KÍCH UỐN PLEXIS S2	KỸ THUẬT PLEXIS	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP889453	\N	\N	\N	\N	t	\N
f27e6eac-9d28-46f9-9e68-ee13507b800d	Màu nhuộm bền Pravana 7.31/7Ga	KỸ THUẬT PRAVANA	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP933701	\N	\N	\N	\N	t	\N
59c92a73-0287-4f25-a581-9fafe84d2380	THUỐC NHUỘM AVEDA LIGHT Gr/V 28G	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084033241	\N	\N	\N	\N	t	\N
0849cdff-7e3b-4a52-b759-4729e5d5484d	THUỐC NHUỘM AVEDA PASTEL B 28G	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084035733\nnull	\N	\N	\N	\N	t	\N
e0f7ef74-0cbe-401f-b7c8-a2bd0932b8c4	THUỐC NHUỘM AVEDA LIGHT V/B 28G	KỸ THUẬT AVEDA	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: Aveda\nSKU: 018084033265\nnull	\N	\N	\N	\N	t	\N
823318a3-5ba8-4209-99a6-7399a3289ef1	MẶT NẠ KERASTASE CẤP ẨM DA ĐẦU  200ML (HYDRA AP)	CHĂM SÓC KERASTASE	\N	Chai	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 3474636397495	\N	\N	\N	\N	t	\N
f2c39a56-ec71-43dc-855c-3995a888cefc	2943584 TẠO KIỂU DÀNH CHO TÓC XOĂN CURLS LIKE US HYDRATING FOAM 200ML	CHĂM SÓC TÓC JOICO	\N	Chai	\N	t	590000	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: 074469562942	\N	\N	\N	\N	t	\N
1bf57d58-a8fe-4c76-afb4-f46f489fbb54	MÀU NHUỘM MILBON 8-55	Kỹ Thuật Milbon	\N	Tuýp	\N	t	\N	0	\N	\N	\N	\N	Thương hiệu: brand_name\nSKU: SP964510\nnull	\N	\N	\N	\N	t	\N
\.


--
-- Data for Name: ProductCategory; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."ProductCategory" (id, name, description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProductStock; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."ProductStock" (id, "productId", "branchId", quantity, "updatedAt", "locationId") FROM stdin;
68ae2286-2fc6-42fe-a0ba-46f7ebf32b4b	3111bcec-d911-4cfd-a6f7-4b5fcb8f9bf0	cmj0bs16u00001atx0vzfjs5n	1800	2025-12-11 13:55:28.983	\N
42817e1e-c36f-401f-a702-b14b19655fb9	f4262979-add4-4de6-b11e-ed79da03cd43	cmj0bs16u00001atx0vzfjs5n	1000	2025-12-11 13:55:28.988	\N
ce6fe9d6-44dc-478d-bf22-638c55c55967	95a46917-ffe2-48ce-81c7-70965ef1af39	cmj0bs16u00001atx0vzfjs5n	500	2025-12-11 13:55:28.992	\N
85b32d0d-808e-483f-baee-35b1536543db	5a82e509-d4bc-46ab-bf32-1dced713f545	cmj0bs16u00001atx0vzfjs5n	2500	2025-12-11 13:55:28.996	\N
bebff5c7-dab7-4f73-977f-270592a6f624	38634b2c-71cd-4b7a-afc4-1c79b5b8aa5e	cmj0bs16u00001atx0vzfjs5n	1500	2025-12-11 13:55:28.999	\N
cc4f4193-679a-43f5-928a-2fe4e047992e	ed72b327-13fa-4902-a5d9-90a24639b1a7	cmj0bs16u00001atx0vzfjs5n	2000	2025-12-11 13:55:29.001	\N
fb146fd9-d758-4261-bb19-825794fde75a	3823207f-9f25-4e97-af86-75fa0460f889	cmj0bs16u00001atx0vzfjs5n	600	2025-12-11 13:55:29.005	\N
7fb36995-e1d2-431b-8bd5-654022a58fbe	e28eb638-ab36-432c-ab4d-0f1e0dae4539	cmj0bs16u00001atx0vzfjs5n	400	2025-12-11 13:55:29.007	\N
7930d81a-e5ba-4ee3-8f2b-b50e574e6d89	0d660156-03d5-42a5-83f8-846850e96fbd	cmj0bs16u00001atx0vzfjs5n	500	2025-12-11 13:55:29.011	\N
128b4d1b-6d6c-4a24-bbda-b637e2122d9f	0dc5eeae-9aa6-4392-8caf-b7a1bf5d86a7	cmj0bs16u00001atx0vzfjs5n	150	2025-12-11 13:55:29.014	\N
55c29f09-0a22-4cba-b8f9-7cc78c30e5d0	722231cf-5e67-409b-af6c-3a1dcdf0783d	cmj0bs16u00001atx0vzfjs5n	100	2025-12-11 13:55:29.018	\N
abb573bd-cfd7-4ef8-885f-eda19a432783	bc2b4975-2dd1-4b3a-99af-891397a65c60	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.243	\N
bee4ea3f-fcbf-4eee-8645-0a90637ff5fb	44b0e254-8f7f-418d-933c-d4680281bf11	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.247	\N
a81620c1-1c02-472f-8b19-98410c69e67e	a63860ab-69d1-49be-bc65-fc7e96970151	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.25	\N
f78f7c7b-31d6-450c-872d-1544d3050fa8	2c772d32-9e21-43eb-8dec-1fec6b7d1600	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.252	\N
c0f0e247-e347-4ecd-9362-05e468fe2f4d	73a07ae5-488a-46ca-9064-b6b0943f3617	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.254	\N
b3e456ef-bc25-4ca1-ac6b-25b254805f44	6f3d4f78-5680-443c-ad31-3c8a1176f0a2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.257	\N
b3e0df32-4443-4eaf-bd16-e130ed5cc6bc	5f2221ba-ed73-4a82-b73a-129c8249cab6	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.259	\N
334dd912-4000-456e-80a6-97e271d0b27a	5f4b150b-e272-41ee-86a2-2a72330e963c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.261	\N
a262056b-af5d-4905-bd15-e8feef131c2f	89eb3f20-d4ed-4f26-a045-1b5050806d23	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.263	\N
730b868b-7a00-46ec-a2fe-3c7679eabbe8	7169758d-c164-4488-bce3-b60e86fa8132	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.265	\N
2adddeee-e823-41de-b4f7-d5ee9beebb91	16245abb-e51f-4ac2-8001-be4984b931a0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.3	\N
c623cbc1-24fe-4bca-8a65-bfd3ea6308b7	b809b8d3-411f-4f7b-ada2-39555d3a4907	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.302	\N
ac4a0961-0cc0-4ea5-9c96-ead5ca854700	1d948950-a77c-4e49-989b-63ca52bbdd09	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.304	\N
9a2ebb88-e257-413c-8165-75797bd5b812	d442d46d-bf1e-47cc-bcf5-115a39d37265	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.306	\N
0f1ab2fa-af50-4c74-8e79-d686888c2ebf	4b58418f-e813-44ce-92ee-efeb5c85df4b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.308	\N
83666cd9-19f3-4e26-8193-a9b9147dd127	0bb8bc70-20ec-4617-b29f-3f15c5f21a5e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.31	\N
d2f5a0aa-53b7-4230-a04b-15eec2418c0d	48e47ed1-47b8-450b-a199-fc3baf5cce43	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.312	\N
0bc42a87-ed48-4ab4-804a-b28df326cd06	5825008c-7b94-4450-b5b6-f06cb11bf733	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.314	\N
50273370-33a1-470a-adc1-f6a1250eba4e	d0177e52-7492-4ddb-9bf3-93d999b0f339	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.316	\N
13b71719-048a-4e99-9631-86fd771f78ca	32ca30ba-629f-4375-90a7-39ca96b64d16	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.318	\N
3fa3f37d-dab0-4881-9fce-ff5c61ee9a20	51e8983d-41af-4cf9-bc1f-24b5d464701e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.32	\N
0a23e339-18f9-43f8-92d0-2b708a0aefc8	97fac3e6-a165-4c5d-bc7c-f01d8c18a01a	cmj0bs16u00001atx0vzfjs5n	1500	2025-12-11 13:55:28.96	\N
aa5897dc-4010-4fb2-a95e-280db854ae58	7b2beb94-6012-4ec2-98ad-84930564e2c7	cmj0bs16u00001atx0vzfjs5n	1200	2025-12-11 13:55:28.967	\N
8ab73c63-d963-47e6-af04-cd3c01d11d96	d26f25c7-7aa5-435a-9f0b-9b36da83a407	cmj0bs16u00001atx0vzfjs5n	800	2025-12-11 13:55:28.971	\N
ff91a251-862c-4850-9888-491a8e3f99df	086d1d26-d9ac-4a13-a027-abe4b5ee420b	cmj0bs16u00001atx0vzfjs5n	600	2025-12-11 13:55:28.976	\N
c85cbffc-c752-4e0b-aac5-25d71d1bb231	374a5e37-ef5a-4983-a690-0eb40ce26bed	cmj0bs16u00001atx0vzfjs5n	2000	2025-12-11 13:55:28.979	\N
5644dcb0-13ef-471c-8eed-740814ad1d8a	067239ed-4190-4f94-bc35-db609d5fe36a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.267	\N
c4367536-d218-496e-acfe-8f328cf1593f	030ff5ac-3c82-4d20-a873-0c6e7617c644	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.269	\N
fe113626-c66b-4307-a460-6c41b3214f04	19663c50-2cb7-4629-a634-a69b3914cdce	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.273	\N
6ab79fd5-c037-45e2-aa8d-e221fcdd5924	d29f5809-06f8-4d41-8153-85114d814866	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.274	\N
b57b7dd9-2932-475e-83ae-475322efaa73	02a8de69-4a50-4d39-b915-0627a3b21ee9	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.276	\N
e7ffd5bb-5ca8-49e7-a5f3-d193667f6562	84e1a9ef-bceb-45b7-b69c-a6bc0235b317	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.278	\N
721b214c-26d1-4e98-90c6-b064fa4120a9	93375fbc-343c-47d2-a1d4-238764387cd9	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.28	\N
eb7b4028-9eef-4f5d-aaf0-436f5243b1ed	88250a33-a6b9-497a-88d9-912a1471ad31	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.282	\N
15836a45-d01f-4c9f-91a6-01cc21eb77f7	f12d28f5-1932-45e6-ac8b-a09624658377	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.284	\N
31a30acd-8e1a-4b9e-a277-5194828f32b5	70cf08d1-8556-4922-acc7-af1b890afb0e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.286	\N
55ed3534-1c66-4878-8ade-b602f4ad6922	ad5decfb-46b4-4911-87f1-cd21e285652c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.288	\N
cbea8261-b655-4036-8738-c76dd3985ba5	d3cfcd7e-4954-42ff-8e9e-e0d52772577d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.29	\N
ecb52197-5318-436d-878c-46ad0f8b7112	585c3267-358a-46c8-ba30-6f23cd8a118e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.292	\N
e3077772-13b2-4028-acc1-f3a0a36fc23f	4b4e99dc-753c-459a-a548-747006de6aab	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.294	\N
90ba49b8-94f6-4466-8894-c0800e5f0ee8	272fa04d-1688-47e3-a673-609313faecb6	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.296	\N
f22cf939-35c3-41dd-b9fd-6b30af9dc192	94f83e9d-85c6-4f5b-a543-68e4d3ca985d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.298	\N
fabd481f-f735-4365-8e67-12b2e888feaa	01ad8da3-98b2-4646-8c1d-37dcad26e517	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.323	\N
b3c8aa6d-0733-4298-884b-b712dafe1815	c7eaa49a-ca68-4a0f-98ae-b9c8130df431	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.325	\N
ea4b94e7-2448-46eb-8d92-975a18de551a	e1396dbc-c21a-44c0-978f-c816cc239505	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.327	\N
9fcec259-b8ac-40a8-9b20-6f7deefd3270	53b54c53-dc2e-4652-bc29-48390fbbb2b8	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.329	\N
f4f6c1d6-737b-4ae4-97f3-42442731fa06	21d330f0-d977-424a-ad65-bc0f14ae1716	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.331	\N
0be8fc26-b235-45b1-ae9c-5fe9165d886e	94c80b1e-5f16-4b97-836b-d4f7d1a6d8ba	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.336	\N
e84b5838-3c3d-4c1a-a9dc-5afe50c07ce8	0bc702d7-ac40-49dd-86f9-8f0932f5aa78	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.338	\N
64028759-417a-40a8-b65a-52bfc71fd96d	344af549-3405-4f81-a538-ca72c9a8b5f0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.34	\N
6a68253c-35ec-4498-9da9-51b9bc7e8eda	08c535f3-951d-4fb8-a70e-aa6ed922fc1d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.342	\N
082b2157-86e6-4822-a049-8e2ba90cbad4	4c2495c1-2eb4-44b1-b22b-ca9a1569858f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.344	\N
22caa6cb-22c4-49a4-98bf-a8866fb4e67e	5317f91f-bfad-4b00-8793-d44b9c67d342	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.346	\N
6867b2be-ff46-406d-92ce-decbaee02f58	6cb6ea78-9f75-4228-8904-6e70ac5d6898	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.349	\N
ce4faded-67c4-4e69-aa3e-d5debbcacda8	edc2a710-c9af-431a-ba89-1d94f761015a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.35	\N
228c2cc5-4f03-4172-94b6-8d926a939457	33059edd-27d2-4005-a016-4c1a6b5f56f4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.353	\N
292dc9d5-c734-43ad-90ef-2430d520f155	685931ee-a1e5-4129-8399-ce0d8093b85e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.355	\N
106f812b-d95f-40ca-b6e8-840ea172a3b2	d267255e-c2bf-4f08-9053-6deb8494688a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.357	\N
2d6a3062-db8c-4985-b528-002d1fa102f3	7b960a90-13b0-47cf-98db-39bf55d18c13	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.36	\N
92afe8c5-acbd-415b-99b0-062cc9897b18	ed34b866-acb6-46d8-9ea8-f3d812abc64e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.362	\N
64eb04fb-4ad2-4292-9b36-87ad7c55b4cc	df182e19-461c-433f-a67a-19198343fc15	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.364	\N
6144c5a4-72db-4801-961a-c11f54c19e5a	186e4109-9ba8-445d-a58e-0904962aa565	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.366	\N
4fd12b70-ad31-4b3d-8913-cfde718fad3d	49ee846d-5c04-4ae0-ac8b-de1063c087e5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.368	\N
804eebd4-39fd-436d-9c52-7352037a4565	846a42bf-b7de-45b5-a3d7-1b7e6680e858	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.37	\N
b5de3574-1a05-4856-ab9c-1f32ac9044d3	0261794f-7468-4d9d-a072-d5f6afd55c8f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.372	\N
5dfd4d8c-cf4d-4ed5-b989-a1f962c29889	978e2706-2a0a-459b-ad90-d73195e07c17	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.375	\N
f98b3136-e972-4d33-987e-994c42383ebb	085d676c-6052-4f9a-a945-6cff8ec3bcbf	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.377	\N
4587567c-2d00-4cad-bbae-cecbc5967a67	cbee3848-f3ec-4c46-ad04-c35769eca60a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.379	\N
9564d6d0-dfe0-4ad2-b422-4ece0defb11d	59bfe4f8-25f3-4996-80d5-78847be3ee57	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.381	\N
f88163a8-6b33-4796-9daf-197c67b2ed60	f800c340-c9b9-43cd-abaf-2fbc34844da8	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.384	\N
3b31ecd7-aff6-4eeb-82c2-2ffa7fc7475a	41ee5109-7246-4aed-bbda-4edbc97e0682	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.386	\N
d459fe03-11c5-419a-93aa-ec70a69ec3fb	f2b2c994-eea3-434e-82dc-69ddf944ceac	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.388	\N
ce20a139-de9c-46e5-8412-0fde75e01624	1f23677b-ce41-49ff-8952-81758f93020b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.39	\N
65b4966d-afc9-4b14-81ac-417e1e4cc91a	9334f49d-c08c-44e3-a1dc-078d318682da	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.392	\N
14ce7973-5922-40fe-bf25-6943c6cbdc62	31f8bef3-15a2-4725-b305-493614edc368	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.395	\N
533d4564-17a7-4328-98c1-115e3ce81cb9	854206e0-773b-4ad2-88b9-adc21d9e6dd8	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.397	\N
7d4c2771-c424-413f-9d36-0834afcda263	07468e38-089d-4672-88a4-b89784b638a2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.399	\N
6d521ba9-241a-45fc-bf87-2764d12f8beb	30a90648-3594-4ee0-b88c-6c67261fc05c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.401	\N
2ef9fadf-bc50-4463-bc04-593d27b89eb9	d0ddce8d-d9ce-4f01-b840-dbc9511efcbd	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.403	\N
0b804a94-0ce9-481b-9111-5ae8ba2cae04	f0443a30-732c-4f11-939f-01e239b9554f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.405	\N
00db0279-a20b-4ff0-8112-e3696915f30f	e71cc83a-4b3f-482b-a011-492c895c3924	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.407	\N
103c28fd-6ca9-463e-8b39-8f950d19a638	a9d087e8-1934-4ee7-9fd4-5f604faeb454	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.41	\N
66c61cb7-421d-40d3-92bf-c9a1e2f5fa1a	879a69fc-7b92-4d18-9fbf-9d0687a67ac0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.412	\N
f6a43932-4b9a-4950-b2df-058d2a8dbbe9	54db5375-6e6a-4cf2-9517-7ffeeef611f1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.414	\N
c1458e74-cdfa-4691-9492-4cdcd87cd945	7ae83bfb-0873-4183-96e5-b6a7c650e8d1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.416	\N
4e6c0842-f737-4693-b527-2b6b47387e6e	e42fdad3-9da5-4049-8dfc-2ba992021f4e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.418	\N
6b4f5652-447f-4a33-812a-94485b715b52	edcb392b-d1a1-4053-afe8-24adff4fb136	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.42	\N
aa95a402-41bf-4886-849c-78bf6d550434	de8f4bd7-45c1-4b03-bd03-044fc9e6e8fc	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.422	\N
dc5864bb-a26b-4493-b350-7931c256f82a	83d09320-90a6-43cd-82bf-2ed1e374d43d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.424	\N
2d163dd3-746d-4990-bf98-91484ec0a651	346820d1-a113-4680-9d4e-b0bdc84fa922	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.427	\N
6da95e82-764b-4bcc-ac4f-ae09a8e7989a	81a18d0f-2e43-4a7d-a422-9b83b0c36cf2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.429	\N
f51db892-5e7d-488f-b55c-1af82977758f	65502f76-b67d-4824-9cdf-ad90aa5cdc52	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.431	\N
f4c79f5d-8d66-4945-b443-0faa93dab7f6	466a8c70-8e75-4d32-8d4d-33b85eb8d8f8	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.433	\N
6e2f7e63-09d0-41c0-8bcb-d598c8666590	e5f945fe-dc9f-451e-a236-e46faf1bebe4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.435	\N
a75cc4da-03a4-412c-99f7-587ffc5b029c	e0ddc492-dced-486a-989b-896a02e3a07e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.437	\N
a205e6d7-ade5-4aaa-b74f-1b598d651666	d9a2cbc3-1c42-4e06-b56b-71e2412b6d93	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.439	\N
752a9dc9-3195-4e06-a95e-3a735cddfb33	9869a859-7a69-410f-ae12-ed75cc32f517	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.441	\N
3e1d96ff-005c-4d99-9fc3-50019899cf49	01608ea0-46a3-411e-ac3b-c179cfecff23	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.444	\N
b4672910-cf27-4c98-b8b0-a1db9f35f098	7e27d7e3-6252-4a5b-8655-e1a89ab5258a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.445	\N
d0accd3e-e4fa-48a9-8913-36325595ac51	890f49c1-8e72-4451-bacb-b12d5e97799a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.447	\N
99be8e9b-439a-4dd6-99f2-af0af3f73fdc	bbc53acc-299e-48aa-a8c5-85427ed4b2e0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.45	\N
2fe40901-9c6c-4078-91da-99ca6c16d9c1	9a6de5c0-19db-4017-8161-3b3a986cd342	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.452	\N
5f6454b2-2afe-4d46-9ebf-259ca97f940c	4501bc9a-7c1d-4e68-8544-c7a87bc1dd18	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.454	\N
08c9458c-0859-4688-8940-ed3ccca0a09a	81f03782-bb33-492b-88bd-7c756214189a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.456	\N
f45aaf01-e671-41c0-bb57-1457c0226993	fce6a4e0-2a3e-44a4-83c4-478cdaaeebe8	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.458	\N
7cba5777-1e80-496a-bfdd-46cc8d20fd8a	d7c5c554-a67a-483b-8f14-823752adf7b3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.461	\N
ba254bf5-60d7-43df-bd68-7b9b7dbdf865	c99cadfd-b570-4e39-ad5f-4593a7e8e74b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.463	\N
2944939a-9f2c-4edb-9fcb-2993a754c806	e9dfe9c6-65b2-43f3-a5a5-024476c1931c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.465	\N
f622c570-6389-44f2-ae7e-7d93bd1ed2ac	d1aa3a63-08be-4bc3-954a-dbfda46c5283	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.467	\N
e92347cd-1f26-4379-a7c7-a096a82cfe0a	7aec3bf9-d854-4f3c-85cd-a57f7170afb5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.47	\N
8b90499a-963d-4015-8557-f1b51f61efdf	0993bcb7-d0c5-45b7-b9ac-a5ecd9cb77a4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.472	\N
a7d58841-dcb6-4a08-aabc-f708ad96f329	571f3de8-2225-408e-a506-8ef7a332f986	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.474	\N
76266aac-dd15-4cc6-a436-4cf41f9e6b99	051f5e6a-2b07-4c96-af07-569261030c4b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.476	\N
33610699-1001-4307-a5d8-5d71e3f33004	9f0e1b20-5048-4309-a09d-ff5402ecf975	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.478	\N
87238e9e-3ebc-424a-b441-f108ea150ce7	090421ed-cdfe-4e2d-b76e-784043797ecd	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.48	\N
e28ab391-ddd0-4340-9d21-c1dd1217885f	4cf8c100-c861-4bba-81df-adebe4d70c5a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.482	\N
eac70b1c-bb1e-4ee2-92a8-add8408eb712	9e8048b7-a42e-450d-9dc9-f9e72d4021c2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.484	\N
58250a8d-b3fc-471d-9c3e-d2ff120846cb	b3eb541d-5703-483a-b8f4-5e1ce49d57d2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.486	\N
439921a4-c235-46ba-99d6-90e4c738ab89	4eb3fb2f-c4ac-4b55-b1b8-8e777564d2de	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.488	\N
d30e493f-9f53-4efa-82f5-928719a9ac8f	fd0c22ae-ea28-4657-a435-dfec3f1630dc	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.49	\N
1a4141a6-ec43-498d-9456-e84703406e45	0217f87b-794f-458b-8e15-de4c8562faab	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.493	\N
98327aaf-2404-4d36-b581-b0f0a0156db4	ce4abc7b-fd54-441d-b20f-e1758a96a142	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.495	\N
fb0884fd-94e3-4233-b7a0-5ef3d454e83d	38bc2498-31d0-44b4-8062-a357aea4aab3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.496	\N
ab9f60bc-b24d-45a4-ba89-44ce1aa3542d	dc1b7c6e-908c-4751-ba87-dfbb7047208d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.499	\N
60d96ae8-fa3e-4cc4-a06b-2a944ec80252	f2059baa-d7dd-4459-b2ea-d7ae6b21c8cb	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.501	\N
d05ecf6e-ca77-4ba6-a0d7-a8688055509f	6ceb32d2-abad-445e-9d3b-54b6b62d743f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.503	\N
94f7d7f6-4ff5-41fc-aec9-7f1500505a0e	3c08bc9f-e766-4fb7-9d37-f79a1cca9acf	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.505	\N
360a71f8-bb6b-4056-8f5c-ad0c469249ca	7202b9b5-79a4-4af3-b88d-c1a96be4163e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.507	\N
de86966d-fc9e-4088-966e-fba9aa6fa4b5	b0e9b3e3-b03d-47e1-af4c-47e41a787747	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.509	\N
1ef3d220-775a-4342-8cf0-bd1288fc5a12	c0cc19c2-9496-4771-b8d7-5e653d9fb590	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.512	\N
a6fa0ecc-2226-477f-94e5-f69080e74ed1	282a1c71-9562-4d4f-a93e-cef11e927ca4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.514	\N
cbc20a52-7e7f-4050-8c0b-6c771a75b0b9	b70a4ef6-94e5-48ab-be8d-0e6123c31f61	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.516	\N
dc96cf0f-fdfb-498a-9bb4-002654f3eb9e	117aa32d-48ba-4a6e-ae60-555582b02af4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.518	\N
d0db24a8-09d7-4587-943b-fe1226da7ef5	77de74b5-2bd1-42ee-a3cb-85deb5739e1a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.52	\N
12c68014-4648-4956-8a79-3cdcff4cd30b	a1fab010-ef8d-4181-9d7a-b6d0dab743e6	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.522	\N
6eb2f86b-4410-464c-9b85-6a53d35416ee	166c4a4f-e209-4a73-84e3-dd389d494b47	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.524	\N
c6b0c6bc-d8e0-4042-8db0-4324fbcfca9a	40941abe-2372-41c8-aac2-cc589f23f998	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.526	\N
10704531-8273-494f-9059-b43860ec8203	b369c679-e40b-498b-982d-1a63a99c8403	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.528	\N
306dc55b-cff6-4c53-997d-5eecbd58fbd8	8f8ec4a2-2aef-4128-be2e-98fe9c63e96e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.53	\N
f668fb9d-bafa-4a26-a318-befb8b52b5d0	2cd53889-2d1a-4dff-887f-b107c60e5a32	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.532	\N
e1132412-ec3b-43f0-90d4-6cf854fc44b3	b5afe0fc-cbd3-4a29-943b-442c2db46e5f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.535	\N
236eab21-f45d-45a9-bf5a-e5ee5a6a3731	822221d5-e9f5-4a72-8c1e-4ef8ff6b1159	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.537	\N
93b7f3ed-2e53-4f3c-9f6c-fb676edb0476	18b62ff9-2d8a-40c4-9060-943a2b0c0433	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.539	\N
c57cc1a5-335b-4162-a317-3dd8f4c912c5	bfe0a664-7522-49e1-9dea-a6cbc18553c4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.541	\N
0511b2ff-2cf2-4bb9-9cdf-dce2236173d3	2c326094-367a-442e-9ded-8dd477be4c84	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.543	\N
e019eefb-34ad-47ee-b865-b8899600cb7b	005abb1c-e808-4ece-8d4b-8389c9956d64	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.545	\N
2b1baa24-e668-4f7d-9d94-f9eefe3ec210	2cea4719-f025-4c25-9d98-e5a4f7691223	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.547	\N
3f502623-ac97-45cf-beb7-796c7c3d9015	a315c21b-a5a2-4a75-bc33-756c36d1aeee	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.549	\N
191329a1-154d-436d-b63d-b28786a93cf9	b64f55ec-ef1e-4dec-9788-0add2b1d7c71	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.551	\N
ff77dfd3-e70e-4055-956f-eeee031831bc	3f8682df-b78e-43d4-a591-a43a52d9f6b5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.553	\N
0ab09b44-8324-40d4-b14d-2f8f3997b671	3316691e-3842-4975-8ac9-7dc990005cd4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.555	\N
528f096e-6e36-4faf-94dd-a985d6ad0bb7	442c3abd-7500-4004-9bfd-a92e478875d8	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.557	\N
c2c48c6a-d08c-4377-a8c1-da684ac70bf0	49bee5cb-2f25-4b4a-ac2b-70a65d78bc11	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.559	\N
470be865-8159-4c43-b6b4-f1d3f178757c	dff5c50a-e492-4e98-a5f9-cba208c56271	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.561	\N
e18cc1f7-1d0e-423f-863d-f8c80d300b66	6026ca72-1441-4af2-a652-6e9bb081c6c0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.563	\N
d416d34f-8280-485c-add1-2291024d644a	c30fb1fc-d243-445e-8eaa-1f51b1df6b11	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.564	\N
4687039b-5b5a-4b45-8f0f-34f53708ffed	9ee2e68f-9fb6-4655-937d-ebe4843f2181	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.566	\N
9cde92bc-e63c-4b85-8578-e3f0143805f3	f5f56a4c-94c2-469b-a541-9c517f9959c5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.568	\N
c54029cd-6300-4a9b-80cb-6f43f545a1c9	b6c4996b-567e-4304-89dd-5a8f0a779704	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.57	\N
ae5350c7-020b-46e6-a349-d1f0766fc334	db60008e-0b5f-4e9b-bc65-a7d4c9e74dba	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.572	\N
d5d8f567-0dca-46c5-ba73-b84c285dfd88	e25fd591-0c58-474d-ae27-e7aa1012ecf3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.574	\N
d49c8cf4-f954-40c2-95ab-d0dafcae6723	dbc0df03-e5ed-4502-9a20-0a826af62b60	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.575	\N
7af29c46-5487-41f6-a59d-03a386e921d4	6524da84-a34e-4c46-910f-e49d3968b6e9	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.577	\N
ea5e9d09-9e45-4ae9-be3f-386eef528bc5	66af0671-88ab-47ac-9f45-d6fc59a1d088	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.58	\N
7a083c9b-af3c-4f04-ac60-7487a3343bce	ef469e9c-46a2-4725-b15b-6f96eda053eb	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.582	\N
6edf1d77-cf9f-4af0-b5bc-5b89b21470ff	9a40acd6-b030-4034-ae84-3d69d75797ab	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.584	\N
f91ce01a-93eb-4ae2-b8ed-3cb25a53778a	f3d8d236-9252-4f52-8029-55dd4e103fc7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.586	\N
91a852dc-ad1f-4fcb-8400-7b686678ba02	c1d66b1a-a993-4cb5-b3a5-b13e216e2cf5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.588	\N
a82b2aac-0a40-445c-a5ca-fd76e2994131	cbba88f8-389f-4a5a-a6b8-9742981694a1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.59	\N
c2d2139d-54ef-4e6d-ad3f-b0a82def3195	60edca9e-c447-487a-889a-fe772a122a7c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.593	\N
14585278-ce87-4f58-bbc5-1adbb0719504	85610e10-c66a-491c-a99e-363a3a5ce448	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.595	\N
5197e830-660f-4fae-bd23-66c30cf9cb9f	7f3640db-bc68-4c8f-aea5-dad675a668f3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.597	\N
951fd36f-4069-4c47-a2bc-ed487c8254ab	6de01d60-de14-4d65-96d6-afbeab995ad4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.599	\N
b2926fa7-5288-46fd-9364-99ddfec5c329	ae723021-282f-458c-90fd-d7c4cc015bf2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.602	\N
06891dbd-f7ec-4023-b80d-ac57d95160ee	7c8a9724-7925-4f68-a4d4-ef1e4422e65f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.604	\N
171fac1d-9b34-42c4-98ba-3b97541f1e43	b6bb9059-fdd2-4dc2-b9f4-a9d6c7aca043	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.606	\N
c9339c74-5055-418b-b6ed-3dba3bc06480	08ea20f8-0c04-49a4-b37b-36bce1accf40	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.609	\N
2ba7ca80-e892-4717-a2bf-92f0ee0cc12f	5a7dc702-520a-4cc3-8b8c-a2f0b6fec8b1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.611	\N
c9446fec-0285-4653-abd6-d45b410d9991	ac0768a5-a89b-4df1-8d50-3bb37e0f21e0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.613	\N
a616298a-31b6-4ea4-83ce-510b69f2316d	4fe3714c-7d71-4769-950c-356624338240	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.615	\N
b6bc72aa-0ea1-4a83-8418-41cf8f126f33	bfc690ed-a373-45d8-a348-bc0342e7666f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.618	\N
a46d1c26-61cd-4075-be22-889a4b8a1096	0aeca08d-f298-4791-b407-770f2b9edba6	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.62	\N
d11e5609-8d0c-41b3-9c1d-78b37fa5b9f1	150d999e-bdc9-42ba-9d8e-66cac3751b90	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.622	\N
6a252be8-6d48-45e0-bded-4fec6a6d2519	cad6614a-c94e-426d-925b-58ac6a65c0a1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.624	\N
8c1ef7cb-8c97-4360-90d3-45b3a9a808a2	720ff6eb-5e04-4b59-b4c0-0d8879d234ac	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.627	\N
f094494f-5ebf-4998-a434-3a9d97af5146	4a1745a7-b5aa-42d1-9497-a53c5de94c60	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.628	\N
864376e5-2ba2-4b52-a859-e44fa4c2e78c	d00d5c22-4f84-4bb4-b6ea-5e6b790b0a25	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.63	\N
5ff97e74-21b4-46ca-a64a-e69b05782310	707f620a-14ff-4a4b-a669-9b0660171e7d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.633	\N
5b5e4c77-45fa-44a2-a784-0ef4dde59aa0	bb18ee06-d1a9-4442-bce8-6acf8dddc666	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.634	\N
b01c1666-73f8-4205-a90f-ea8d0ff607e9	341e130f-c8a8-49d8-93bf-1f8d61e028bd	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.636	\N
9f4be228-36ba-4bc6-b446-ffaf78fa06d1	d1cd33b1-7e51-4dc0-80e9-0a6e62c77eb0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.638	\N
e14624b8-a822-4a38-9396-8a1ed78d0946	5a083632-0ce8-4d6a-9e4f-bcfecd5877a2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.64	\N
882ad96a-4dd0-4d41-888d-e330f999ba1a	f1822400-30ad-43b2-a3e2-4cbcba8c064f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.643	\N
119e3f25-da08-4b06-bc42-47a62799426c	4ac1ea95-92e3-4ff8-b944-fd790a873533	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.646	\N
d4e3c362-7d93-440a-9cfe-d04b26359cda	d616bdc0-ebbb-41e4-8b31-9aa96dafc4de	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.649	\N
150a6631-5749-408e-9909-2ed0ff99a07f	f986d855-3f08-4b09-8c76-b4deab153f60	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.651	\N
6f099ccf-219a-438a-9a39-d8235446685e	86a6f905-93a5-4dbe-9a19-f477900c546f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.653	\N
99e2dac3-57d7-47ad-8487-f63ddeeee9fe	b7d03631-c0f4-4b86-9cc1-828bd83e9611	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.655	\N
c56ac592-a13d-47f7-8294-5b8e9fa082c9	46d868e6-064b-4be2-a4a8-d2345e386531	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.657	\N
27b13fe8-8251-42eb-9477-1948a06f1df3	85cf4d33-bebd-4c87-9e5d-624edcfd0989	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.659	\N
8f28e5c2-c120-478a-a034-6d996b522b32	ed3a4bc5-a64e-4a5d-91c6-2ee8fc2f2350	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.661	\N
8134399b-e638-43e5-be4a-9e92e89b8662	b3f68ba6-4f68-436b-a12d-b347df12183b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.664	\N
8085cd2b-7e39-45a2-a2e1-d13f20bb007b	b265cb19-623b-452e-b24b-b4da3d356a0a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.666	\N
bb69e991-ea47-4a10-8878-46ba8fc215f6	c9a7609d-0b99-4088-a45a-510727c74f93	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.668	\N
f1855c81-5cd4-4ec8-a859-1c7f2a7086e2	cf746d4b-e0e9-484b-ac3f-5e75c6e1e770	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.67	\N
c34d76fa-d3c3-4627-8abe-463373acb66d	46b71c9a-e6c1-4f27-b1f2-663a3f5ae6cc	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.672	\N
06fbf67d-9a59-4f8a-be06-39ba87b25a92	fa0a5477-a0e8-45e8-9f4d-6324da8df245	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.674	\N
40631183-b507-4ed1-8a6b-61b6bc856cce	9dfe0265-a789-434b-bf6f-57ebda5cc4fe	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.676	\N
38bc4d5b-4dca-4fcd-b019-de2c7a7e3ff3	1f817323-7834-43b6-8e3d-3601048ef5f5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.679	\N
39e6cfbc-f96d-42b4-88ca-d6a6eb9178a3	f65206e6-e121-4708-bd05-2bdb3ec9a4e6	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.681	\N
26c78a23-8810-4853-9ed5-b7e3b6266c54	ea65840f-4e21-4321-8746-e6ded8c2dc80	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.683	\N
1534f343-db6b-45de-9f2a-2a32f0ed4143	45a89418-3c2a-4658-87c8-7b67cd6e7c67	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.685	\N
2c80c0f0-92d6-4162-b445-c5899b7f03bd	477a7231-9105-46e4-904f-7af3c65abe32	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.687	\N
e81e7e58-b61e-4502-aac2-eaef1299bbf1	1b3a43a0-940c-40a7-bfc3-56e3d1891d71	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.689	\N
ed24b1f5-76a3-4b3f-87da-6ec621643bf0	5f8d4d79-b71c-46e2-83f2-d5424c6f4243	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.691	\N
5183ddf8-e048-4e33-8346-1809f6664e9d	49b594e2-c834-4456-b2fb-413dcda7942d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.693	\N
52efa9ad-1a3d-466f-99dd-2be45cdbbd06	f770fd9b-47d2-4b58-b531-9b11a86f505e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.695	\N
64181a16-31a4-4945-baf1-ad80d8d76751	d4d94149-17c4-44df-8c93-a18fac2bcf40	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.698	\N
59e664ab-0c30-4307-babd-bc73afa4bdb2	a5fa6798-e929-4959-b988-543fe938a95c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.7	\N
488aa700-581a-4b13-941c-7937314acbc0	30e72874-31b8-4e6b-97ae-c4a86ac06471	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.702	\N
8f104386-6c02-427e-8126-38b315769901	6d41f805-c3a3-4b02-9c43-1c738de89adf	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.704	\N
074a215e-8e96-406f-978b-ee7c3894575e	eef07d0d-4b9c-45eb-ad44-b3b689507ac6	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.707	\N
61e95577-7f5f-4a22-9809-68dc555299fe	7ea89186-590c-4377-a399-841d4d38de87	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.709	\N
81c928ca-36f2-4072-8b7c-175d0b26d39d	58929763-1d54-4152-929a-97ae89a8e3b7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.711	\N
5adf9550-d367-451f-b21f-30f2ea06c6b7	01723ead-fd3c-4df9-a00c-247b3aa25db7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.713	\N
006f2440-56b8-44eb-9b3c-03101de42de8	f7b538ce-92a8-4de5-b549-200b14d4f03d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.715	\N
757fd032-cc41-4141-bc85-b6cc174bdbce	ffac4d1f-eaf8-46e3-82b9-ef37f0907825	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.718	\N
9f8363f5-b237-4016-b8a1-239a0d06e56c	e8628cc7-70ac-4e93-b9ac-eba91199695d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.72	\N
9a1a45b1-7b84-4c1a-9f45-fc7ba035d591	0db29f36-0d8a-4de1-a9a7-85d3cab06cb4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.722	\N
eac6b027-6907-4fa6-bb17-b02102f3b139	45e23bd2-ae28-4b12-a46e-184e07319a6e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.724	\N
5aa31b6b-8d8a-451c-8db9-e6003d8eb767	e702ef89-f039-438a-abde-722fb5b418a3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.726	\N
eb3ddc25-2c09-48d2-8bbf-078c46fe4810	1666bcde-ebad-47b2-97b8-3ef7a892242a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.728	\N
1ca978f7-fdf6-4d0a-b4c8-e2a65d9490ed	6421601d-d0e2-4fd1-8853-930c1bb57fb8	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.73	\N
73b9879a-d13e-4106-87c4-7bd6905620e4	cdb1a16e-2846-45e4-843d-8305cd146e32	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.732	\N
b8e66a09-eef0-4b2e-b34d-7d7491647782	16c9bdd3-3179-407b-bd50-b7badc33a647	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.735	\N
5f4a7aeb-2fca-4163-9e8e-0acba82f53fd	82477b2c-ec63-498c-9d4f-072587196916	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.737	\N
dd5ea786-7b56-41b2-8195-fcd31e53ed77	fce65995-2758-4a7c-8684-2908d6a35a7a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.739	\N
12862004-22f8-4877-8065-cd955ee86346	e140e796-47a9-498d-a80f-1483e95e6cc5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.741	\N
febca5e3-447c-4a0e-8b9b-b64c217e640b	d41a1adb-144c-4cbd-b806-25d7a0a79979	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.743	\N
bd36cd1a-8440-41e0-87e2-73ce6b895f48	30ebe313-c274-4e31-b3a1-137fdd0453e3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.745	\N
c7e02d0f-bca8-45ca-a0bc-bc78160e19cc	093b885c-5cfb-49a9-b27c-e80202f9603a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.748	\N
9c4c9e57-f497-40c1-adb1-0bbad42fbc14	d5f6bd3a-5159-4d96-8e56-9fb1ca5c3bc4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.75	\N
3745cd48-6d0c-4652-8905-6459fe633900	5b7844ae-f798-4b9a-b646-94feb2ff78a5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.752	\N
fd595bd9-7552-44f0-b7f6-4c0e81356f00	41fb4405-5976-4ddc-ae0f-c67243af0332	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.755	\N
24a42e76-82fa-4cb3-8c4b-478477fdbc7f	8d25c1d2-b614-4ce5-876a-5e219b56bd9e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.757	\N
81fefb74-61c1-4f43-95ce-8300dc095ac3	35e92e07-5f9d-4971-9c76-d8676e548037	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.76	\N
440b0b14-0b81-4b93-8689-354237551b52	982e7e83-7313-4cef-90d5-fbcfff54364c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.762	\N
b7653c61-f298-4956-9ce4-c40dc27db08e	f5c0a591-545b-44a6-909b-0823dfe56369	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.764	\N
cca47565-fa62-4245-b18a-3a7d0bb577db	4f096abd-b1d1-4d0f-abb4-dca9e34603c7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.767	\N
0829f4bb-f538-4bc2-93f0-9c10cea4e719	a6672e56-7517-478c-99a7-f63c4e360b42	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.769	\N
298a0563-4251-4c45-8608-ff4fa1ccce4d	439fc65c-63ef-4584-bacb-206980e77ad7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.771	\N
11805066-7606-4e92-b7da-39a9587712ea	4f117c97-614f-417b-8974-1623a3165203	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.774	\N
09cb74e9-489d-4449-974b-0d2fe53ca52e	c24a2c0d-506a-431d-8a67-ab9e34016c63	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.776	\N
75db1dc6-fd48-4068-a806-73e672577f10	eee0d707-fafc-44cd-825e-e189cb51e194	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.778	\N
2d0ef69c-203b-4b22-baff-3b626becb5e2	d02070dd-3185-4d70-9689-ad4e34254c96	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.78	\N
15f60a2c-09e1-4bf5-89da-aec38c0e7e0a	e3ce59f3-8b32-4726-b359-1b97075934e4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.782	\N
833c670a-c26c-48b7-bd57-5da1e263c3f8	9f19504a-1d02-41a3-8110-3b824404158d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.785	\N
f7413e75-985d-41ea-9ef8-702ed9f96c2b	8fb156af-efd6-4ac1-bc55-03ac028acd9b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.787	\N
d6f08162-7738-4ce0-84ef-cfc204ad53c9	88e295e0-ed7d-4272-aca2-1f2eb05122f9	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.789	\N
524d1bb7-7711-4c9a-b20b-db68bc40acd5	5431a787-96fe-4821-998b-f895ba54155f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.792	\N
869e69ce-ca82-4844-b5a8-3ca3d74efbdd	d9279dfe-1a11-4dc8-a2f1-7c5050b283c1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.794	\N
bdd0ed8c-83dd-49e5-9d40-2f69f0b0e32f	285a8768-213f-4d86-a594-ae73968ed490	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.796	\N
d185421d-a721-46c6-aa3c-8a697fce5210	6850cdee-ed51-45a6-8e86-285312a6d2e8	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.798	\N
5ad8af0b-9e4c-47f5-94b0-090100c13ac6	b7c48263-8da8-48e6-8f19-e7505b9133cc	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.8	\N
36a44561-3872-4620-8d62-3ea595dd1ee3	0e40214e-35e9-48c8-9b9f-536fe1dd7e67	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.802	\N
8eb35589-2044-4d83-9528-eadadb511069	1f7e7dae-f837-4270-ae73-b41f2313a1d7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.804	\N
d706d140-72a7-4480-bec1-17f628ea1753	58ccfbd6-ca97-4cb7-b209-d2fa1bbff2ed	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.807	\N
1ad9546a-b22f-419c-8fd6-a9f47e442ebe	59da3e3f-df57-4702-94de-3d1d007eb3d7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.809	\N
92abaca1-fa26-4c2e-bf4a-e627326c534d	4a7cd32e-f5bf-4556-a996-925effbddcf4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.811	\N
ee8736d6-3895-41f0-8683-2c0638afe7dd	5e929242-0741-40cf-9823-66bc683ce5d3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.812	\N
c7b1eb0c-6b2c-474b-b8df-a45f83819718	0c955a9b-8848-4740-bb04-ed020bd5cf6d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.815	\N
072ddd9d-6273-4fb2-939b-6ae505a3f72c	eaac4a3f-4cef-4454-b5e6-0e132f20b9b4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.817	\N
df648476-3bc6-4008-a4fc-e2ccc1b4a22e	b2c95853-71cf-44fc-86de-c5ebebdb8a3b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.819	\N
3333a2c6-85ed-430a-99b8-5adf8302faf9	b4c9aa4f-fff0-4195-af6f-986216f87b4f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.821	\N
ef2d2bb1-57dc-49d2-addf-145cd7b9a7cb	78fa8b58-071b-4696-96d0-1ad6239ec8ab	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.823	\N
14ad4a33-a868-47ca-bcdb-d8fb3312b65a	0a3002c2-6b3a-4647-80ad-131852a6ffb6	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.826	\N
f86a64db-b2d7-4906-afa8-33add67a486a	455cf237-8eed-44c5-aa6e-2450fc3238e7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.827	\N
a6185b2d-1f16-4c48-a6c8-35c789b9b97d	816c9105-9d81-470b-b3a3-77c18d20df8d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.829	\N
873c296b-2bb6-40e6-a1c0-2cc2c21b9802	31089fb3-ab89-4c19-bc67-7b1b14139f05	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.831	\N
5f29e212-4200-41b7-98a6-8d28de489f0e	dc9de14b-ac98-43f1-806a-664d246856b3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.834	\N
02854e61-c6f6-42b4-95ba-de651fdba1ef	0e677c97-17b8-4737-a91f-107d48128b23	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.836	\N
88a9b82c-35e4-4cf3-a28f-2297bd436c34	1d4cad23-4d7c-4b81-af92-a6b4842856a6	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.838	\N
f5922719-f152-4e32-bf6c-c2cb2aa84bc4	bce9e8ba-b403-4996-bd2f-449be4a13404	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.84	\N
3847cd98-a028-4f49-b522-f9c483d5851b	2abf276c-e46f-47aa-898d-0dc51d4bc569	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.842	\N
c6497d39-bcea-495e-bdeb-955198d16640	0cb47e17-2b0b-46f6-a4a7-67dfe3ad538c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.845	\N
0808e4fc-7c03-4df7-9cb7-30b1ad4f0597	a5cbce31-dffa-4dba-b4ea-ee6210283a61	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.847	\N
150d4731-9de6-409d-99fa-8195571d270a	0dd62463-d838-47cb-8b5c-39a7dfad5ce5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.849	\N
20ef2a92-e025-4331-891e-67ecda9ec3e3	4174df2f-5605-43df-97f3-1b8440416768	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.851	\N
8e4c1c78-a5a8-45ac-ac74-ed8f0b1eaa7d	a37adc17-3222-42f1-a4bf-ce27055504ed	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.853	\N
708e807a-4e1c-4161-a28f-9ff9a2ff867e	65030dad-242c-4e0b-ae48-8cbe2e579558	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.855	\N
32db9e64-4cd5-47c1-b901-9d3ff7e57fa5	9c06f176-4b9d-423d-a748-55416344c156	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.857	\N
2a1c6b01-4a00-4686-bb00-7351ee047a3d	64003b81-5656-453a-a9f6-690ea8d6d77a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.86	\N
2af8e9c0-b622-4033-8039-bfa581219265	5e246a1a-ba35-4c20-8ffa-23649f207428	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.862	\N
40872312-8019-41c7-80b1-acc1b0352fb3	8b533287-7a6e-435b-aef2-651957c04dbb	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.864	\N
62774f3e-2cc9-4a05-aef4-85abeed2e89a	8236e4c3-1a33-4d7f-921c-ea5f30b9ca4b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.866	\N
af568e6a-28ba-4425-889b-0d673a5172a4	7d4efacd-ed08-4343-b1e3-dcf8892d8b13	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.869	\N
99600b0b-1c8d-443d-890d-d65bddb30f08	c1428b84-e891-42ee-b444-2c368c2e32ca	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.873	\N
2300f7c2-8e07-4f41-b510-9e82e7b31ab8	9b648e71-2163-4159-ae26-a131a1fa9856	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.878	\N
89728e3f-4c74-424c-aa32-9766a4cccb25	c5622b16-2c8a-43d0-99e6-349e2c47e73c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.881	\N
5591c851-c836-47f1-a440-c998900a1a63	e284db93-98a2-4a0e-848f-097c129ca5bd	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.886	\N
470a78be-c8d2-49b0-9504-f524d61deeb4	d2fdc9cc-094b-41f2-80c4-d2f95017a877	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.89	\N
4e8caa37-5c0f-4c8b-b719-7968c8540b2b	d9041205-b5f4-437d-922d-24a3da40e671	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.892	\N
250bf5be-89c1-4be3-905d-c4c9470556d6	18e9950a-1052-4d6a-9698-4ddcb3fcf5b8	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.894	\N
1bb2c3d1-0dfe-4911-8843-10a57255e44c	f6164ad2-59f9-4131-8050-f7081bd610e5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.896	\N
1e0e0fbc-300e-4ee2-8cec-f820a3b6525a	30e24b0d-6a6f-4f91-9bb0-e624171c2f30	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.899	\N
051144bf-86d8-49bb-bf20-c96443debc38	b9c1b40e-4315-442e-88d4-2bd2dea471fc	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.901	\N
f2e5f799-4f4d-493b-8beb-9a3b0e871561	f5ada923-1ed9-4100-850f-b2fe1ffefab4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.903	\N
f3a97461-e62e-4c4f-b8f7-3a4924e69823	f8b2f830-3797-492d-a44f-e46b250ba90e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.905	\N
152fbcb8-cfa8-47e1-b5ee-4e8d8fec1714	7b44fedf-c982-4719-a012-4fcc6b1c9685	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.907	\N
40fc2f05-52f4-4463-b1f6-e75ffbe14c6b	c2a2bd6f-1c05-4c89-9548-79988e60c24b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.909	\N
37699b55-4c01-403a-9fd6-635b425cc25d	c2d00fc3-0171-4bf1-bba0-4f93eff33cb0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.911	\N
db03b5a7-0f18-42ec-882b-107d327da750	95453569-f1ef-4945-9b80-4fd65f6fd72d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.913	\N
deed8ee4-c763-4f7c-94f6-ffb5bbdd4673	6b84bae7-8eac-4f0d-bc73-47caef751c84	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.915	\N
f103501f-f8a5-42fb-8494-ec1731115d08	f3a41af4-d9d5-46f7-84be-0975443ed29e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.917	\N
5c22910f-6614-48a5-a8c0-cd4c9430e382	f78c286a-c34c-4f8f-934f-475cff7af5f3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.919	\N
a5eed048-8f98-401a-b9df-68dd4536de0c	b7838304-70a1-48ba-acba-cca78e923aea	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.92	\N
1411b74f-3464-485c-8acd-c46716a28aea	b364cdc5-543f-4c82-abc9-4e85b2447bae	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.922	\N
15401c02-68b1-4af9-8a23-9cd3ad57401f	013d95db-7fe1-46f4-bf69-84718712afd6	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.924	\N
fed89c47-239b-4b14-a064-3ef0e6925e94	983e3cec-0864-47bf-9749-d7c4d2ccca42	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.926	\N
52d0520f-9f66-4780-b47e-62d67161b1fa	e3a90db5-4759-4f57-acb8-587346d14628	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.927	\N
24640c29-c7ed-44b8-afe0-f142fafc0ccc	c48eb5aa-e438-424d-8488-126b9d92d444	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.929	\N
5679aa76-6214-4780-8163-6b5e4656995c	45bd8662-1d20-402d-9144-237dffe51809	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.931	\N
945d1f58-fc93-4808-b05a-9784ef717f25	845f9523-91ae-4bd1-acb5-7203342fe2ab	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.933	\N
1a5bf607-a919-4980-acba-2a76cf9bf6a5	429b88f3-023a-45fa-ac58-52630947d2b7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.934	\N
a4985bde-cc35-48bb-95e1-eb5e9d734f69	4d3e5ddf-70db-4f4e-9527-5b88ee627fe2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.936	\N
bdd84115-5074-42f8-b276-ac6c4d3ee353	e51e8f93-3f6d-4490-947f-4916183755fd	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.938	\N
04abb2e2-a313-4238-8bf8-160f6fa0054e	def21252-b5af-4757-b05c-f55fa6f7f05a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.94	\N
d96a1e78-a131-4782-b04f-87bbf27d3278	26afb93c-3a31-41e2-8b99-fa788a78177f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.943	\N
cd7fe9b7-d41a-4c4d-9f41-bdf263c3bbb3	69c6c2a9-2e0f-4a9a-ba26-b38b337b8a35	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.945	\N
d78840ab-ea1c-4b52-9966-3869dcfbe069	8e15f359-3dfe-4ccc-9e76-baca1fd22051	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.947	\N
9a798ae3-d005-4ef3-b35c-76db1d3347aa	42542dbc-f9dc-43f9-943b-a15904e44a59	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.95	\N
553fd4b9-e3f5-4035-bb13-47b5a979c413	4b9284f6-656d-438a-8110-4a93dda8d0fc	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.952	\N
4b31b42b-6cc2-4e7b-ab73-06c9268af48d	3c062c8a-afd2-485d-8d89-27b97a1eafa6	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.954	\N
a087dac6-c80f-418b-acd1-e06719b866d5	70235936-144e-4124-9ad2-d56fa77c9197	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.956	\N
5a920f56-06c0-42db-ae88-acc17a29a241	c01bda63-5b43-462b-aee6-5d50966dbbe5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.959	\N
f571a3b7-fe41-4458-9bcd-88d07a6e70b9	a85d52ef-dda1-4f36-8cf1-dcd97d6427fe	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.961	\N
a78d866c-1417-432f-9506-6199b5bef770	89a61a9d-f118-4a63-b400-2337314e7a1a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.963	\N
e797b9b9-e7dd-4716-846c-2b6bde79b398	4609b886-65fe-49fa-b232-4be094cd9b2e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.965	\N
0c761d15-4968-42d0-947b-3c851bb64d7f	d36829f6-ca76-4b4b-88d0-4f3c484627c9	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.967	\N
10b7bca7-36e2-43f2-bce8-fea7a3da839b	cafd0df9-9e02-4be9-a011-c1009da0ca5e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.969	\N
69f19c0f-51fd-4f55-a3b1-a3a29f7a82e1	8527637b-c03c-4c44-9907-921d9100ab2a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.971	\N
6a5651a7-a92c-4fba-862e-dca4d6e740b3	7ed6b858-6185-4ee5-9720-ed8dbb5580f2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.973	\N
a16cabe5-2ea3-4e34-bd91-5e1320c24412	cf3f624a-f71c-4098-bd5c-741cf361e018	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.976	\N
2b38f185-732a-47e0-949c-cf387c047db0	05e1a996-f2c8-4e8f-b28b-40f0f3101971	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.978	\N
2c6e7268-53f7-49f1-a01d-bfcb77384c53	4445c806-f232-4c3c-9da4-46e862f504c0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.98	\N
4a2bc2cf-8072-4577-89e0-274450aa56d7	d74d363e-d5cf-476d-87d1-42d0eadad311	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.982	\N
db9ff274-0629-4a6b-9927-ea7b71da7f66	53f204a3-48af-4135-ad03-0283a85aff13	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.984	\N
2cdbd86b-f557-4d30-980c-043d2cfb8fdb	3ed846c1-224a-46cd-b515-6e4af6d64d64	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.986	\N
658874cc-b22a-4819-8988-e1cbc0c1f3b8	2704bedb-856e-41fd-829f-f3295c24d1aa	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.988	\N
ab3944c0-f60b-4748-a7c6-8418361c9ce0	225e911a-7380-4299-9c02-babac8e146a6	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.99	\N
c2a7a2a2-d872-4254-bbc3-e063c6e7f6cf	46d1b30d-4119-4564-9ae1-d2b62ac4ce16	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.992	\N
f1d701ca-748a-4285-be46-c64676e6ed11	7eb724b3-74c4-4c89-82b8-302516cff576	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.994	\N
cc270970-25de-4da1-9d6f-f1314d6efccc	2606d1ff-50ba-4e63-bcfd-ec75a6a208bd	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.995	\N
a0451733-6f11-492e-a850-30ed264e4533	80eb3c26-c159-4158-ace7-e68529225fae	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.997	\N
b28a8f16-4e0e-45f0-ae37-7c2111cf4591	85d36c6f-d919-41b2-8c02-0d6bb2003a91	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:34.999	\N
10ef2994-f9cb-4816-b83e-e73b93cf7648	3a7c7bb8-db08-485a-a8c5-e33db03264f3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.001	\N
d2886ff0-bcf6-4624-8a10-51679900f0e3	658070ca-ef27-4adc-bbda-73e2a70cc721	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.003	\N
3cf7f83f-661a-4542-8f80-e8d39fd75611	f472e5b1-0f28-4151-8796-6cf9d35396c1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.005	\N
8cf3a73b-5d62-40b9-8b89-d2704e927b18	eafd781f-694a-4710-8106-271c1e11a782	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.007	\N
3c822027-3b42-4142-b039-9ce9387e1278	077c3b2c-2a22-4c56-9668-e5ec27ddeaa0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.01	\N
76a8666b-249f-4eec-8f6f-b0edabf649b8	f286be88-805a-424b-adb3-98bce5c6558f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.012	\N
27754c9f-a443-42f2-9a27-db836b06c76f	e99130aa-3ab4-499c-ab96-470e04f3314a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.014	\N
e865d242-90b9-4d2c-a3f4-8f55f3e374c4	9a9f64f1-60eb-4705-84b8-41e8095b278d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.016	\N
cc267053-2a6a-4427-a5e6-a1efc37dad19	3c89572a-db2c-41bc-98b3-eb08858bf22b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.019	\N
9155deac-f743-46ab-9c0a-e0be896bf930	f4014606-e74b-4354-abfc-05f034ec6e56	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.021	\N
d7bc2506-11f5-4ad2-afc1-13ffe74ad6a2	1e5b3e59-a7ea-4509-915b-6a8a1c7e5886	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.023	\N
9c3194f0-6103-45d2-906a-046f89358926	d25ef02a-c2da-42b2-a2ea-69274ba5c345	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.025	\N
eec85e44-2bc7-4316-bcc0-86f650d6aac3	3e1b78dd-24ba-4713-ba82-da1b7d4691b4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.027	\N
314627e3-6d96-440e-abb7-f596afca6b9d	e56265c4-fea8-4614-bdbc-316d1f106b07	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.029	\N
42ec5310-35a7-45fe-9b2f-53804929c51d	24e3859d-c6b1-4a86-8802-ded23e2ca3b2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.031	\N
11e56627-ad9d-43bb-8a6e-df7fedab32e2	b1887b8c-80d6-40ac-843c-5d1b57a4e676	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.034	\N
1285fa31-7a21-4f79-81ae-f0c45fe03c4e	5a81ad99-b82b-44a7-9993-b82152669deb	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.035	\N
8997c715-2dc9-4e39-8e12-f05ece9b886d	cdebb876-46f7-4c87-adaa-e8585635d0d2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.037	\N
ea42cc34-94df-4613-aaa8-ea773c1205b6	5d22fef0-b309-4dc7-9849-ee7d9bf981e5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.039	\N
9497a684-244b-4e40-adb9-0d7d38ba0b99	3d0ed16a-210e-4c87-aff9-a0c8c6a02a80	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.042	\N
b688dda4-ce68-40bd-8301-a972e1eed574	a19e4af7-17f0-445f-8c4c-e1aae8729d78	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.044	\N
f80eda72-698a-402b-a2db-de047f858529	4d17caf4-b176-4b2b-969f-270810f92c16	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.046	\N
d02a72f8-5116-477e-86e3-73cec8b5548f	1e2a7d4c-7b2e-4d1b-9e9c-b8809cbb329c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.048	\N
319484ab-bee1-4929-8adc-01c3cc258b90	8ac69b16-a0d9-4194-beb3-6135e86403e9	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.05	\N
25e3fa4b-9da6-4067-b00d-ea5a09276b50	52d75790-4478-40e7-8c4e-5c10ec2e564d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.052	\N
b1173819-f7b4-4f8d-8291-6cbee926cda7	4268130e-00bf-4144-bd12-15322564ad67	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.055	\N
823948f1-fa02-4207-a254-0d1c7420875e	6142f316-3248-4055-8598-850cc87daecb	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.057	\N
e4c319d8-8f3b-45bd-8ed0-cb9fe8aadc69	13cce9da-829c-4d1f-a088-dcd7b0791900	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.059	\N
cf6e448c-8606-4c87-bfb2-359440c00ca6	67d0f4e4-0799-4c28-990e-7b3a329afab2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.061	\N
332557b2-bb5e-4d08-975a-a258d3d1c6f9	c7e20f22-d268-44f6-8eff-00a7f4b993e4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.063	\N
5d183caf-541b-49c8-a7cc-a1701e58a840	99b4edf5-b474-4d10-b89e-670877cb95d0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.065	\N
a252bc06-3ab1-4043-bff6-275107011eff	1a6a1722-75fe-4079-8a5c-92980331db22	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.067	\N
cdd9e9c0-a22f-4317-b62c-2a45fb8451c1	e84f52fc-4b38-45be-886d-6e612583c7a1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.069	\N
a7fc1d4a-367c-4634-9faf-f62654ad5a17	4b77eed2-7f71-4c29-825c-4c258656d02a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.072	\N
3aa5817f-0cc8-4f50-87a4-649e06ebb59a	400c5d85-7539-4664-b7e2-1599101e4347	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.074	\N
ffa08c9e-bcce-4672-b512-140858f4e3fc	9f6176bb-47bc-4e27-a6cd-60daf35ab9c7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.077	\N
c4827905-4e25-4c92-9a14-3037cb5bbd21	b5fe6340-8630-409b-ad9d-5f5ecb8fabae	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.08	\N
c90b77c9-d048-4de8-80fa-484b3c182616	14872f55-ccb1-4a23-b03f-4e9b5d9016e7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.082	\N
025bd0fc-b6de-4036-9373-14cf62ca40d6	074a0256-dd3f-45a7-9c33-b9a9d122808c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.085	\N
d5f5da35-167a-4f2d-9872-7568140334bd	cd264643-366a-4084-ac5b-10ff4d96cc38	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.087	\N
9c602365-836e-4548-a00c-6a8c2e7e6c28	c62d6ff1-66d4-467a-a44a-ed801cbe9e15	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.089	\N
b68d297b-d245-4797-ab4c-967255086234	315aab79-546b-419a-9cdc-01bd8fb1b170	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.091	\N
f69bbd00-39d7-49de-9220-9c4539fec29a	05e8f474-0d43-4c67-8a6a-bcc3be90b160	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.094	\N
eeebd6ed-9eca-4e7b-8081-9c4334ca8fa5	75344f44-f9ad-4b5a-afc5-9cfb6b84d733	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.097	\N
181ab69f-d1a6-4208-92da-22e5035f4999	59320dac-82f9-4f27-bd8f-a02f5104304f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.099	\N
724cbecc-39ee-4f28-bca1-32dcc7015faa	d9aedcfd-2db7-4a33-93f6-87b8715281bf	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.101	\N
8ad2a5ce-2461-4d24-9ada-8d4757c67a69	9cd66fc4-78b6-4801-858c-2cdd603d8d61	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.103	\N
6d309de7-428e-4c6a-9094-cf7a037498a1	d4250910-ed89-4138-93f9-4f47882c1368	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.106	\N
3fd2a8b1-2881-44f3-8871-e2eaeb17872d	1fc15cad-0d06-4435-9e35-fe2a47060bb1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.108	\N
ad514bde-96b1-441d-80a3-14bda0c0c7cf	066a6405-db78-4bd7-b44c-037610c6580a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.11	\N
3817b656-109c-4260-836f-9523f5cd3f8d	1c1730c2-1c9d-4562-ac02-e2542ca87362	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.113	\N
f615b642-bc83-4bf2-bf50-700fb3253031	4f74d668-aae7-432c-b729-fda84152069f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.115	\N
07a049b2-0cfd-4a98-b833-08d2a5c71109	7fa98800-a2dc-4c86-92d7-c633d6201715	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.123	\N
aa64279d-c244-41aa-8411-d1c65e5d66fa	e86e5e98-7836-4b1c-bb21-e7a984eb09e9	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.125	\N
bd749c71-055d-4496-bbd8-9c53b8d57957	fa89c901-dc15-4ebb-b173-2dbabf732a27	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.127	\N
7b043129-d34c-4733-8b20-ff6738e2ded6	a08c1356-80f8-4623-8c44-5e2e8175b989	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.129	\N
820db012-a539-4041-b360-df20668660e2	a5616e31-5c27-4589-abfe-4ea8dd4f3d01	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.132	\N
8815e532-42e8-4268-9e99-bf6335fa3d2b	36a64c9f-6955-4d68-ba84-d1e7cf5b7e32	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.134	\N
761387c5-58b2-4465-bb53-ee4bb7ad755d	6f382844-d23d-437d-83d0-0fee3c8760e5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.136	\N
68fdd5fd-368d-4d2f-bc28-a9f40a10f575	9e3979d5-e694-4df0-8bec-d664eab134ba	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.138	\N
75f7d991-7b8c-4d11-a574-6056c5e0b24d	4a8884b4-7e97-4f7a-b5a3-e9de74216627	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.14	\N
e74f299a-ce67-4c10-b749-5045417ef5d4	893b310d-b062-4df2-84ee-5643484452e6	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.143	\N
39144d2f-5d60-4604-bac9-4008977a2f49	966fbab6-57a0-4e2e-b62e-db911eaec22d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.145	\N
99c99263-505f-423a-9bf4-0d0cb0df05e3	2f53155d-f4b8-4869-b81c-4bc044043741	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.147	\N
2a947efa-f436-4a5f-8d1e-db1800d79771	e3c17808-fce4-4a28-9fa9-5be82ca36ff7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.15	\N
bec4cdec-2cde-4282-a387-26fd8c697658	61a85276-f061-4b69-8f0f-6ef9d78d3b32	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.152	\N
9dee3be5-20e8-4e68-8a45-e1e85fcb31d8	f357141f-fa4e-48a3-b13b-e8606a9897c7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.154	\N
e8b27e25-b53b-48f3-a3e9-7becc42f5c22	61f18c4d-d200-4326-a18f-ff8c49162f71	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.157	\N
7dbf59d3-a43d-44f5-b5f3-660283cbb0da	1cf93b51-7851-407e-b12a-0517301b1adf	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.16	\N
b67694a7-ebdf-4b5d-9302-93086f571139	dd1aaf14-5282-4f64-88d1-474f8c04e4a4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.162	\N
97d3100f-3d1f-41c9-86fb-112e215845ac	f4cfb096-5ce4-48cb-9e64-1dbebe46b70b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.164	\N
cbc9e94e-2c27-4377-9d20-c7a253bd8db1	4e7e1ad5-e0eb-4ad5-95bf-e7734ddf7bfb	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.166	\N
175e8535-5cb4-4c4f-b4ba-6f12eac07093	f252a9bc-e71b-4195-956a-cc0f221ca6ce	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.168	\N
f47fe785-753f-4644-b299-4b4ef4c3b343	ab99d719-faac-47a2-b553-70a5ae72fe52	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.171	\N
73f9bb66-faa3-4ec9-83ea-c24c1da26d42	0e58d35a-bb1a-4394-a2d0-c6da2be9051b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.173	\N
cf6a0eb2-6b66-4c56-a188-c863bb41ca55	f25ef8fd-e70d-4127-9422-d0f25efe8b10	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.175	\N
a681fc0c-9769-467f-9780-84f568e7e90b	49e5cc96-7429-4b6a-8d96-f35943054c78	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.178	\N
a12b2f1a-2d03-46d0-ad3f-cd0408e1a06d	d9d80b68-24fe-4239-9597-b3a2340c6212	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.18	\N
0206db4c-372e-49b1-96c2-f63e49d6825b	710e08ff-5ccf-46f3-af2b-ce943d9e8434	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.182	\N
2e1d6d41-fd0c-4a43-aab8-7c644287d713	15f17b1f-6d92-45e4-aac2-ec581158e6b1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.185	\N
02c1e9de-25b0-465b-87b5-bc5982cf57fd	955f8ce8-35c1-4ac0-9e1f-2c999fb38b47	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.187	\N
8f914a85-7c97-406b-b990-772765d18392	506d6672-4567-46a3-b408-0513b9fdba7f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.189	\N
df9b036a-0ea9-45a6-9b76-63aded38df29	36227255-99be-41c6-80ca-456ee7e018a7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.192	\N
9b907b2e-5cc0-49ba-a7b8-e8b5c27a356f	64c62fdc-45ed-4584-834c-c2a0e7af1e7d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.194	\N
019d7c31-870c-4b9c-9621-bd47abfbc14b	638069b5-6ace-450b-adb2-eb0eddf549b7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.197	\N
58e34f9a-cb71-4813-b145-9f080b9a8e56	40659012-608f-4940-a985-6cf2a80a33d2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.199	\N
803d3e42-47d7-4351-9a14-bb80eaba0ad1	6ff45791-f810-48fa-b48e-0279b7152b93	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.201	\N
10867d63-9453-4427-835a-5c19aefe04a2	0b86255d-93ee-4860-98f7-ac56bcc05774	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.203	\N
63468de7-67ca-48ac-b31e-5d5d38e069a3	6444272e-0eae-4be3-b159-cb6bd950792c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.204	\N
15ff1e29-0554-4d71-800c-4e4ecaec2ebe	a8a1e6f2-b9b6-46eb-99e2-7f266d6b7868	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.206	\N
e6e96e69-b643-4cf7-967c-2d2b1b9f1131	0d9f6376-f833-4eb3-9e82-73e54c05299b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.209	\N
85d6c046-75ab-4bd2-84a6-94a018d0e22f	db3ea8f5-db70-468e-9b7d-c8a232c511ec	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.211	\N
86377158-e15d-4966-bfa1-16b864cee561	819eecca-9bc4-45cd-9f0e-c534295caee9	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.212	\N
fb1d35ad-de97-4772-b010-243581bb877e	e576d958-0f2c-4cb7-bb7b-2af904d6220c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.214	\N
1073f429-159c-4d90-994e-ceb5898db199	ef4569ee-df42-4bb2-b8a1-6973bf0ecb04	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.216	\N
1a61d1e8-f2cc-4e5a-838b-c2dd5add0070	03f8e546-b0e9-46b2-bf1f-0276636442b3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.218	\N
58cf892e-772b-4166-9126-cc8cca0967b6	07493458-cc0f-483f-b40d-ed0721135186	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.22	\N
620ce729-da31-4a89-a797-c534dfa8a8ff	0f216f4e-0d6d-41cc-a27a-192ecc5f60c0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.222	\N
686165b9-ef37-4916-89a2-7f129175f61d	d61cde13-98f0-4461-9f07-41e24eb77a8e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.224	\N
8a74ca3b-b8d3-4f18-b2aa-bcddbc789257	53b432bf-5643-4435-81bb-a26b8240dc8b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.226	\N
ca35c841-6004-433b-9611-44f307e6abe1	83a6b765-8fcd-4fee-862d-f55b325c11f4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.228	\N
4988c724-0071-44fc-9b79-9f91e19868f6	58995799-adbc-4a7e-9830-efb3572ecc36	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.23	\N
46779a8a-1ab4-4539-b288-4b3ca5d6d728	1d75ff19-5571-472c-9fa2-915f7efa9f1b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.232	\N
75e323ca-cc1b-40c8-b31d-96d42eb27022	1fa541be-4ccc-4656-94be-d8bfa4601a67	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.234	\N
b1e4c392-2850-4ecc-a7ad-16ba86422939	cc5201a8-a902-4c45-bd1b-d21ba9aa6790	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.236	\N
4ebc0a4e-d5e9-436c-a55a-fc7c7f83dbfa	51b0d0de-c826-40e2-9a72-be4429923dd4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.238	\N
a4fa601f-5e83-4aa7-80bd-c7037e687462	2c7dbe2b-68bc-4e3c-bc00-53f7a24cfbc4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.24	\N
77dfbf4c-92a9-4e4f-a7d4-7c54568e5995	e9e8457a-b5aa-44bc-8e11-b020564f2f99	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.243	\N
7c11f3b0-bdee-42c3-a478-35e3217aca5a	20aed028-8e96-4f27-938f-5d32481edbce	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.245	\N
d172ca7b-268b-400a-9e11-33f079bf717b	71d98eef-6279-4329-89bd-6180a0d964e9	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.247	\N
989bc131-baac-4650-b3ac-6db3793a140e	6c379020-95a6-4b37-b203-6c0c0074c0b3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.249	\N
74e3cc6c-d2a8-4a69-bfee-9bd7793f8e06	673b74eb-b6c3-4268-84cb-0cc14854e91d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.252	\N
acd3032d-1beb-4a50-a7a1-6ead01dcf6e0	c7f0dd68-0e87-44a0-b1ed-3da650cf9629	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.254	\N
9c01ddbf-3a18-4304-a6f2-55a855237239	eb7f42e6-a19e-438f-9803-c1d1808c1110	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.256	\N
0b4e7567-3548-4d9f-95a1-d7fb895f30cb	c69bce36-2186-472e-9591-094edddec791	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.258	\N
1e2fa5a6-02ea-4e93-aea7-28fd35019c73	1b94550d-76b4-4f30-a112-69c68eba5083	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.26	\N
7811de46-241e-498c-8120-0521f4812a11	5db848d0-cdf0-4766-a0a9-90a73ac0f3a1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.262	\N
8ca814fe-7167-43b8-b3ea-dcb4f7496f87	d93db714-26f0-4440-a3a1-ef792e0d29de	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.264	\N
9a1a96a4-9f9c-4e4a-b8d6-a8810cc95f45	0245ccea-9405-4328-9d7b-211f6e612138	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.267	\N
f3977ea2-3d7c-4b79-a47d-898d0e281eac	a7552ba9-18bb-47c5-823b-834e69c58402	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.269	\N
5597110b-96db-4b6c-bf08-73de963dc511	b290e140-3848-4f14-97e0-20ae809fac05	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.271	\N
125d36db-035d-4c99-9530-b5b15e8fd485	f8154207-8b6c-4cde-a7a1-30c1dfe6b0f3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.273	\N
79e009e7-75b5-4cda-a57f-67428f96cbdc	a75eef40-0e6e-492f-8ad5-5735a9055e4e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.276	\N
0ba19f73-5242-4345-9c6c-df94c46e8e9d	6ac1315d-a5c8-409f-b9b2-86e64b09c4c4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.278	\N
83e4fb9b-a58b-4fe1-bde4-173e188460cb	2e3b54a7-9d97-4c1a-9cf8-92cb0ec11426	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.28	\N
cfc9cd88-e319-49f6-ae22-9dfa250772b7	19d2ff1c-ad53-4192-bcc6-c78518604b04	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.282	\N
cb2f9ab7-f6c1-4178-8bee-0fa252571855	f7e47304-df13-4473-b84f-9eb70834f86e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.285	\N
60eb5583-29ff-4b34-b080-1332cd5b8876	304f61f3-4841-4d90-8e9b-8cdda0e430ef	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.287	\N
e6043309-a411-4f00-a199-402a3fbaa8f7	e78bbe20-ac38-4341-9b22-a5c5d3ef525c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.289	\N
7df8958c-2325-4d41-b264-719d57f81afb	b7c960f5-1d58-438c-9832-e79c32dc2b81	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.291	\N
d9ac8466-bbef-4b3a-adf3-c7ecd08835f2	0784475e-c493-4356-a70e-25f19af6ab1e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.293	\N
f7baefc7-d31d-48cc-92f8-aa2c1a205ddf	01ed501d-c808-4af9-8527-9291ced556ed	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.295	\N
d76c240d-5e9c-4f77-88bf-7ba1df0dea24	77f4372a-3326-4268-a693-ad71042eab9f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.297	\N
4b849415-1939-4e71-ada4-c0cefeb4f9e0	4d0e1c28-5a79-4772-a2b0-36e39232b489	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.3	\N
c9cc9574-bcad-4c59-b03f-7ae691f2143d	5d66d603-a46c-41e1-a198-7f92d96cce80	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.302	\N
66960009-d348-45e8-a409-922c24e33776	c8878622-41af-4476-b718-6984e6423ae5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.304	\N
774e8d52-7b19-4133-b2f6-5400d661edc3	5c896381-c4d7-4221-8d53-a1791feca868	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.306	\N
42eb9d10-9af0-4da0-b414-f465e6ba2d99	9199f77a-8b14-4ea8-91e4-68b9496c7413	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.308	\N
fe6fa768-976c-437b-9fd3-6a15e9003430	a1eec0f7-1610-474c-843f-d94fb2fcf3e7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.31	\N
aeabeefa-752f-4b8d-b2dd-5887e32f56d2	e4014564-1d4e-4d22-a87b-bce167af866a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.312	\N
72d02a9c-0c5b-452e-b365-ec937f937645	907d9c32-1c79-473b-bfa1-ec8d6a21ace3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.315	\N
5b490024-61c6-4b60-a5c1-a4e71150b7c4	a8f72a3f-580c-4655-b2d5-0b116114d06b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.317	\N
4315d254-a9d1-4a21-b233-60b94d516b7e	bf12c227-e635-49ff-aca6-c9d2ee4fd410	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.319	\N
c2201d9d-02b0-4f47-94a0-58069fac50ec	131bf1c0-31e5-43a5-94af-18fd035eb569	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.321	\N
6d545463-1b90-4a6e-8122-d84d693a49ef	308bf20c-5bfe-4bf2-9617-7335dfb1ea03	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.323	\N
52aeefe4-6823-4c4c-b20f-fdfc6e691ccb	2f06998c-407d-4d33-8284-674dd00d714c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.326	\N
dd2be3ac-aca3-4f0b-be85-65512a3076d5	e8ae21b5-1327-4cb3-bdd1-153c6bc4e40d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.328	\N
be8c684b-b1fb-46fc-8171-6a0d3c4e3890	c7b85a31-97cc-4fd7-8ee8-9b53fb505bcd	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.33	\N
4704a94b-5372-40b9-8305-cc830de35ba0	9dd675a0-c803-4ec8-9a7b-c276f38211cb	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.332	\N
643a06fb-442d-494b-a6a9-d70f43ce2c1d	c8f71d26-4b77-4cc9-bf0a-81e6b63fc335	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.334	\N
8d9ce860-cf05-4092-b2f4-82f71e4d3c2e	5650cc38-7120-40f2-9cb0-c7731bdb8359	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.337	\N
6570a1f0-7e48-41d6-942e-ad4d7ba267d1	f5092b70-bc1a-4d42-be60-9148037587f7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.339	\N
19a822f4-c4b8-469c-8417-b5119a6d3e5f	bbd701a4-dfdc-4761-bcb8-c81a9fb092cb	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.341	\N
361b79ab-03c4-47ac-8ac9-b7e50546e074	f3a7e848-21fe-458e-89d5-eace182a2461	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.343	\N
0527c465-10d6-4da0-910b-3ef6113b5b0e	2e1101a9-0aa8-455d-8a90-dc4fa8d3486c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.345	\N
f8d5c2c7-e925-43d3-8e58-daeb1b8b9156	7b5b5f2c-2974-4232-a96b-d9e090cbd37f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.347	\N
ab3ec0c3-74de-48e1-b88f-935110dd578e	b0c6b8e1-f0a0-43dc-bddc-eb049cc65d61	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.349	\N
19e23c14-a2f0-4181-bdaa-9016b9f4ab59	b3fa7a4a-1d01-4f5e-b758-740ff43dc7bc	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.352	\N
d7939073-7302-45c5-b1bb-f6b84249087f	f5795de7-c6d5-40db-be9e-fbcfb26759f7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.354	\N
03be3293-3808-4856-8f31-452cf7489cbe	26c2aa20-b48b-458a-ae7b-b487dd1070e0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.356	\N
f3524a26-c114-434a-936e-c094e16cc63c	1870b200-f2f5-4de2-b367-38ef1c4319ea	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.358	\N
8a7d4e2b-a761-4da4-97d5-6542b1ad088c	f509d7d9-aff6-409a-8853-ba00f6b7225a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.36	\N
659b6447-6cd8-47db-a936-012ae1c397fc	ec31fbde-78f4-45fc-8d50-8f6f551ddf33	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.362	\N
518b70aa-da80-4187-9be3-3909eb3049af	21f072d6-0e37-45de-87da-e06b3e128ad3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.364	\N
786e38d0-1d23-4051-ba13-c493a61c27e5	bd8e24ad-e0cb-4d69-b9f8-66ed1bad058a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.366	\N
8a2ccc19-c0a8-494a-93ce-a299ec79099b	0a4c75c7-d1e8-4ad0-aad9-4a85c3c54ce0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.368	\N
557f60d3-d4f2-4c51-806e-0b1b055413f5	4788b46e-e3d9-4090-86b9-5462a5eb79ce	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.37	\N
52148d9e-9285-4a50-8574-2550074f82c5	abdcf0c3-482e-4062-a7ac-12763b0d2bfe	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.373	\N
931e423d-d0ed-4ed6-8958-af3921a51dac	cfad3aff-d9c1-4ee0-99b3-484fdcd3649b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.375	\N
51af99cc-9882-44fc-919a-7ed2f96ed866	502b07d0-a455-4ea1-9241-d8770f513c34	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.377	\N
f34be51f-2d44-433f-bb01-2cf8790041db	6f32e26f-d93a-4b08-906a-aa3f3fc6875d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.379	\N
e130e153-dbce-4b44-974f-bcb259a5658b	47466f6b-f3ff-40bc-871c-9fabd209d968	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.381	\N
a573aef8-5efa-4532-86fc-2abfdb4c4dcc	0693b38b-6a86-428a-abb7-44ef5ac5d8a7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.384	\N
9e97e5a0-7463-4393-972c-8695753bb4ea	ea9a5e11-88c2-4442-ae67-54b2e9eff907	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.386	\N
be798cab-fdfc-4d5e-bf50-c483b65b80b5	cdd7157d-aa0d-4876-a60e-d1c841792823	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.388	\N
b3ded8ad-c8fe-4aa9-965b-fbe097c1e92c	9a2480e6-e0c2-488a-9927-83d98c229e25	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.39	\N
bb2077d3-5828-4780-abe0-f7555aea9a2d	8307103e-f9e3-4e5c-b206-604eaa2a0ef0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.393	\N
ad773831-d01d-467e-bd69-20ad883061c1	29de1f1d-0371-4fc5-b28e-6218cecdc7b3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.395	\N
82769b7c-eb13-4ae3-933d-7a9d33eb0b8d	45011e4c-6503-45eb-b0b3-4aa2c454375a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.398	\N
3c9bcb63-9ae5-444e-b242-90a05518b195	af98d37e-408a-450f-9efe-2ef7b99370f0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.4	\N
237a11f5-4cc5-4dde-9e67-b7d3403c1459	7d47409b-8d5f-455d-ac8d-67a3f249c257	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.402	\N
cb3daaea-8480-48fd-9610-f7ce64a023f5	61bfe2d7-e78d-4a07-af1f-ad00277cf24b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.404	\N
f14336a8-072f-4737-96dd-7becf62b7467	8e61f913-f7bd-4ba6-b637-5ad928a0691c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.406	\N
75bc9070-4495-4c48-ab61-f139b3253de8	8698a83b-c659-4121-bd20-5a9f5b327800	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.41	\N
3c1f18cc-15a7-4f56-b35a-445af09dd62f	9552534f-288a-410c-8bc5-52b919fc388f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.411	\N
4fd91a85-6385-47da-bf11-9600c4470e16	8221ec8f-b283-473a-a1a9-5f88e1a28d38	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.413	\N
aea080cf-524e-4f5c-92c2-724ac0db2b2c	7f64af75-61db-4379-baee-3ba8f4873d15	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.415	\N
1e64a02e-f9d0-4118-a1a1-6d3736f5c9ae	e8cbafa8-ef57-436e-b29f-32af1638d4fe	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.417	\N
db84c6b7-0b72-425f-913c-c89dcb7fac1c	ea47edb8-6590-40e7-9bca-2f77b5a56809	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.419	\N
b4b02bf3-aa0e-4106-8699-329e82c524ff	0b2f243a-4640-4409-973c-a56ef8608c01	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.421	\N
c1789b17-b8cc-4704-adc8-ae82aea46735	826c8f84-fd57-460a-bd01-69a52d45592d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.423	\N
43662790-e733-4bcc-a5ff-1ea1695a61d0	135621e9-d014-44d3-9316-c1ad504b31bf	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.425	\N
dae77cae-69ca-441b-b718-9859a37bc749	1260f96f-a278-4bf0-82fd-50f11d5eab93	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.427	\N
c92254eb-b7c9-48c2-9faa-51a35ac52968	a012435d-861e-4df9-b7d0-c7fa90d877c0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.428	\N
93294d2c-ad5d-4632-b525-3fbe395a95b4	e1e8731f-2c20-4e42-a210-db590ecc2b03	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.43	\N
902de3c8-c1a3-42c0-93a8-0a129a8e2fdf	1e5dbdad-15ab-4071-9e94-721dc45e2bec	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.433	\N
8ef2a0fa-5e75-4afe-bf9e-9cab6914d6f7	524bd730-0126-40dd-8f5b-b660790a4426	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.435	\N
e9799f70-6300-4867-914b-f6dee2b6bb53	0289ff17-c714-4b26-957f-2f3ff4263385	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.437	\N
2ac55263-bcf1-4b32-b60d-9d16ac864c8d	5fc173c4-9fe7-480f-8297-39332f94279c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.439	\N
cc84f7b8-2d07-4e01-b581-f2786ecc8499	db8a818b-6f16-468c-8b20-730d85741909	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.441	\N
7ffe0ad7-ec52-4874-b266-59c3d2f2798a	21aa6f21-86c7-44b7-bc62-fec16c84918d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.443	\N
9590b8eb-baac-4d22-974f-cf4eb79af4c5	46b6a5d9-8e16-42d4-93d2-41f9fe6c21a4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.445	\N
8670849f-9b70-47ef-a325-f06c3864d815	2a6a9263-5330-4e74-b4cd-a50387e793bb	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.447	\N
68a602d4-734c-42da-abb6-4750c6109b6b	199ac5ab-593b-4ffa-ad08-bfeb66e87790	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.449	\N
dbefb9d1-1661-4d80-9bc6-05d478d8aff9	04bd3f33-c515-4f53-9917-d6a7ba85e9ae	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.453	\N
24a440db-be03-4455-b57a-17266e30a2a8	5c6414d0-483f-44e1-b795-f43e8aa50046	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.456	\N
cb5e4f04-2d1a-4154-87cd-361b1c774055	43a585d7-9de5-4283-9304-ad4bc43c0c8f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.458	\N
71e18789-20ad-405b-a684-f99c8a6715fa	384ac885-be5c-458e-9942-c18eaa1dcb38	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.462	\N
352646ef-5820-4fae-b7d8-8cfc946ca0b5	dd1fb376-a936-4352-8d88-896a341873a0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.464	\N
a1f51109-9194-46e7-8dfc-f4c42acb1e02	bd896141-5d2c-4575-99c0-929671247388	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.467	\N
ebbb06ff-5667-4bb5-b5a2-85146d886d9d	ecd797f4-0650-4adb-a42d-d86bc19e450f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.469	\N
f8720ca5-d17d-4da2-828e-a6f86d712e73	53405672-40bf-4757-bb28-e221755f7845	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.471	\N
42c96234-e96e-4fa8-8f12-2c6ab257eb91	cac7d119-2d41-4d8c-ba8f-914d597bfe81	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.473	\N
aff3df85-886e-423d-8f2d-4e389cc505fd	86b26fa3-5dd9-474d-b044-e5f4a3ba346a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.475	\N
88f76220-98d6-43b5-8fcb-3ae0fef5cef9	5a1fc68e-e947-47a9-9cec-599072b96190	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.478	\N
edf1f3e6-ea54-4331-8333-886cbfc51b86	29f7d1cf-7fc1-452f-8cb2-95764e20cca9	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.48	\N
84478900-c42a-4142-a6b2-527701d04f69	53df7dce-d93a-4f8a-a3f7-71d592fc0659	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.482	\N
2fdcf6ac-a035-490a-a5d0-7c9e8946cd50	4282f2a6-adc4-4510-944d-113d62e4766f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.484	\N
39964576-040f-49a7-90a7-8fc7bc606aaf	22b9bc0a-6eb9-4263-8ae8-6b97491a2843	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.486	\N
596487cd-4d05-444d-bdef-44f8920aaf4c	c7570bb4-8883-4467-8e05-3e936fd82bae	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.488	\N
57948e10-bdba-4930-8e62-9fda7750ff53	e77678b0-4611-4988-840c-a346e6da5300	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.49	\N
14c18abb-b89b-4bd6-8115-8fe107953db9	3aeaf6da-a9d3-4b04-921b-f274e595a088	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.493	\N
002b5e6e-d81e-4dab-bdb0-08be29598527	55614624-b4d3-4be1-a565-8b9e18da3d56	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.494	\N
fc7bf21d-21d4-401e-916c-26f4540e75bd	8b305631-386a-4f46-9dc3-7320fb2058fa	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.497	\N
1c93451c-4c7d-4dc9-a73b-23a1fd4ac31e	4db6445d-9a7e-4b48-89dd-7d88991bb9b2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.499	\N
c0b5a302-d30a-4b52-9ba8-154a5bee4714	5e3c3733-69ea-4e43-bb9c-5287fd19ef5b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.501	\N
2379c466-943e-4548-8073-3a223d6b018b	2638d326-64e5-48cf-98af-090d666b3d04	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.503	\N
e93ff758-6c34-4571-98f6-80a0aa00ff13	4afc4711-6392-48b3-9b47-3277e7284faa	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.506	\N
cc4a0bf3-2648-404e-a895-f03623f70d70	075cecfe-8c90-4d17-a36e-634d44a1ef3b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.507	\N
9b1a02db-11c5-4ce0-9ea1-be33700da60f	de802ad5-1592-4a11-8d1b-8973983b60e3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.509	\N
73a32ae4-b280-47c8-9b1b-9ceb22459326	b5a8f61b-1a20-4666-b8b4-1e8d9506262e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.516	\N
5df09bfe-1396-40e5-8576-351787af8bee	3daf090e-396b-44a8-81e4-2d304182fd8c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.519	\N
012eb588-90be-4569-a334-b7720803cd32	fe201b57-b3db-4dcc-a55f-1dd89db22a77	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.521	\N
92c31589-7d0e-4130-b99f-3640b8807087	7ab78c99-69e1-4743-ba56-f09edf8ba8ae	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.523	\N
bee67dde-d98d-4637-819f-ae07effbbd3b	d51daaf8-90e5-4424-8107-f58f3eef86f5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.526	\N
86a3e8c0-b936-440d-8bd3-a8888a6daabc	88697959-cafb-4e9a-9c87-0a80569dafe9	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.528	\N
508115e8-ed8f-40d5-acc2-5f723991df0f	08a31c8d-5328-4d7c-a152-6b55678315e7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.53	\N
9e3b009d-704f-4709-8886-620ebe94001a	0ae160cc-d1a5-48d0-9096-b92dd9962ee2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.532	\N
68f30475-6b97-4ced-be67-c4d1a7a197e3	1d53f18a-6837-4753-8f09-a8b2974c69b3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.534	\N
1b06fb62-9729-4293-adee-e38fff5c2503	46a33b21-351b-4e88-9ba5-62399f3f0c0c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.536	\N
bf486ec1-1fa2-4913-bc5c-7e0162f54516	2bbded14-3e68-4c2a-acb4-bd95f2ec4e4c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.539	\N
ebf1983e-2be0-4f0c-9673-435fb3b3e647	6e3500f3-5852-452a-a2e7-c70c4582bd5b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.541	\N
7dcb1887-5c33-4bd3-9ce4-89ae90773f07	d6f1fcf6-6ed6-4116-af6b-46aac3bf6d3d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.543	\N
97eb8af6-70a8-4cfb-8a49-3b58dbedc886	6d23e3e1-9831-4e75-96fd-19987200aa21	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.546	\N
de2f5af7-2754-4b59-8e8d-5a92ffc7f9a4	becb453e-f270-4a56-a602-0eab1cd6e983	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.548	\N
498164ac-903b-45d1-8d6a-e31f165bcb08	99a002da-d53f-48e9-8fb7-7b4bd03337d7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.55	\N
182922e2-6e65-4274-8754-297480fd83cf	adba35f9-1997-42d1-ac57-16d16bdf2023	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.552	\N
77397321-a838-4155-bdca-470e64e47931	edf4ca0a-ecc2-4ef7-aef3-e47e21019634	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.554	\N
75536990-c8a2-498e-bb11-c77f554584c9	addf982d-ee1d-442c-96b6-a6da1fd2289b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.557	\N
c3f2e1b4-b4f5-429a-8604-e46d4f170db3	fb242be9-a85f-4a8d-beac-4fd978f65bfd	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.559	\N
b7442b98-ef39-4079-884c-f20355b80fa3	54ab0321-0296-454f-83f9-31f7694b6f74	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.561	\N
1861903b-c4e8-4831-8e7f-e2ea35d0771a	6bbc0a36-fae9-4563-9503-a47c14cd9aca	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.563	\N
b381cdc2-e64d-456f-adce-8f202a7cc5f6	a59e1372-b1ca-4742-a7c3-7740d718267e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.565	\N
5dd7a9a0-aa83-4474-9802-c6b4cabccaeb	464cf89d-193e-4255-af14-6f112476e2c2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.567	\N
8c02c65b-0930-40f5-8730-d1d077806775	37bd9e5a-58e8-4b63-a2cc-8a757c713ef2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.57	\N
a89529e7-9eb1-40ff-b2d9-43f5c228c879	a6280022-a940-4e4a-80af-4cf737ecd312	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.572	\N
790345c2-7c29-46cc-8b42-794fb7a4d2b2	4db78d26-7763-4226-a606-58dc1d05f330	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.574	\N
f1ec105b-3617-4881-bd69-76676db54ce8	c6e00631-d713-483d-bda5-5b2ef59afdc9	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.576	\N
d4038fd2-2516-4937-b198-a5f9e32c065c	f324ee54-4c06-4821-bb1d-e87e6e53171d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.578	\N
7306cfd9-6a29-4635-b029-cbe06923190a	6c11b133-4dfa-448f-bccf-73604ae93742	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.58	\N
dced5ac4-f1dc-4919-837d-ca56ff8cd607	939241bc-5eb9-46e6-8cff-f0b5bea69e51	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.582	\N
0fc167bf-6306-405e-84cd-901bfe272967	60c1cad5-543d-477f-84de-2a7a2ae78018	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.584	\N
268b96ba-c4fb-4e44-b089-9f9081fe39e2	2fa9c49e-fb44-4837-aff3-c3750ba9073e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.586	\N
67db1dc1-479e-44a4-9a2e-48527d8633bb	afe51542-89a6-4f41-a870-e52c7bfdede7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.587	\N
54da81d3-a3f2-4871-98be-84d1a59e4ea8	7692865e-6b6a-4f40-ab4f-14bdebc15de0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.589	\N
6744ee1c-c4dd-4460-9f1d-2c624ccef97d	3dca3fa0-7969-451f-9f5c-f37a6d51c70a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.591	\N
dc95d96f-db44-449f-9ef3-60bf002a909c	03b5702e-7447-4f25-8be4-7e745c1d9949	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.593	\N
3bb4a4fe-b7dd-4565-aa99-656edbd4afd0	be57b587-0868-4608-bf18-589cf3353b51	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.595	\N
51837c4c-b406-4f5c-b03e-3d947c070b3b	9d8a68d4-f796-4983-b2d6-e8f893b7b7d4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.597	\N
610d8360-7e32-4daa-b02a-a33c545048fa	8a1756cb-96cd-4c83-9624-b7f3cecffe67	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.599	\N
1ef90144-7200-46a8-8860-9ab7c0152642	5b681abf-8e95-4a4b-acbc-fe6fbbfe7123	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.602	\N
5581d6c8-1255-473f-9d37-d866a146be0a	a96eea4e-7730-4bc5-8cba-23f85871fd25	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.605	\N
912f3c57-1ad1-4fab-8d1b-9b6189a6d63f	ddcc724b-a7ba-4b44-887c-09bb22951792	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.607	\N
b6e80f04-3a09-436c-aed8-119d8fb5c677	b7a6c436-1da7-4ba5-b1eb-08598ca95d7a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.609	\N
e8d1ee76-7096-47a2-893d-fc099f03de9c	340c6326-319b-422e-9544-b7b1b9e156db	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.611	\N
412b6933-99b5-4cf2-90b6-4c8bd5308b0a	86dcbfbb-d1c4-4823-98cc-c6e3b719f4eb	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.613	\N
a2d459a2-ee3c-4f30-b342-5a3f38315863	f4bf28e0-78c3-47b4-82a1-0e9942309ee7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.615	\N
c6269c7b-0106-4495-9046-8367af91af21	83343961-9084-4d76-908b-9b8e58f025aa	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.617	\N
d96a9e7d-6b01-49ed-afe8-1b74de40adaa	a9d3250c-15d3-4797-aea5-5878f480be53	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.619	\N
44d0337d-8a51-4f01-94d8-100e1d936b22	00ccbbf4-51ad-4e85-bfb5-ed0dc237a331	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.622	\N
2b744afc-8254-489a-bcee-20bbb62506dc	b5590c5b-2726-4f21-80ab-8383998acfb1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.624	\N
84e48f88-44c5-4d73-bae6-ed8b949bbd39	b9acd384-7fa9-44e3-a333-53f2764859e3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.626	\N
37b556fd-9afc-422a-ad62-22f154910dcc	f1ae6286-72d9-434b-ae97-7d62a1420ac2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.628	\N
16b9ee31-3c14-43ec-98bf-9ffb928f75e1	4ec2ba2d-5c70-4715-b325-7695fa48d883	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.631	\N
6d73316c-63ff-4f0a-ae91-a6c3b60a6b1e	a6cdd15d-2f05-41b5-9b49-d3a74fed7a78	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.633	\N
6975880f-f792-4657-b982-c7067e999657	5c370ed5-bd05-4c46-939a-8cc83e6643a0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.635	\N
5eb7ee94-db92-4a1e-969c-7e554a1851b5	55c5b835-7971-4d95-b9e1-470b76bead61	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.637	\N
263e5874-44db-4e2a-8b20-51e6b7a768c6	ef3b8eb4-6509-4373-86cf-93cd53a0fa4d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.639	\N
165dbbcd-b636-49af-a858-d66c7712465d	29016938-8442-4da0-936e-6e7181f73b51	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.642	\N
f1bee796-8c40-4031-a44d-584ac00bf0cc	2fd2911b-5dce-4d8d-93a6-998e1bfbea3c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.644	\N
3b2a8cf3-2797-40d0-b832-8141dd9ff380	38a149de-b615-472c-9240-1a182e64ae19	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.646	\N
17905130-dc64-4e51-a5d0-1e931856fc22	dfbbb08a-298c-424c-b589-1f71df30bfd4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.648	\N
7fc11ebf-a614-4f84-8357-e0ae98019326	b0e0f285-15b5-4036-820b-06cce5f0be47	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.651	\N
03695608-b0f7-4a37-8df3-00c3d27b3a8d	147656e6-c800-471d-a46e-a54456c76404	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.652	\N
bace766d-a979-4581-baac-1553227af679	bc300a81-5445-4ce1-816d-037dbf0e71cb	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.655	\N
f7abb5af-4a2d-492c-b52e-6ba7a070d1ca	2ed761cf-d083-4a42-a514-0aa32801b606	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.657	\N
f4a3ee2f-a5cb-4315-9478-da948b272bc3	fad4e54f-d6bf-4095-b716-58717f8f4b14	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.659	\N
a30dc7c1-54d0-44ca-b996-1c2898bf03ec	50bae076-3344-471d-bdf9-453213153e96	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.661	\N
1918909f-66dd-4e75-ab5c-bc273590b18e	d328e3e8-0e59-4585-89a3-ccb52ddbd86c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.663	\N
69db43f5-ed7c-452c-8123-35ef5b3257d9	b6a79a81-eaeb-4f20-ad63-6bedf7ab5984	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.665	\N
9e5024a1-9139-4905-bdb0-fbe23773f125	e0d8814a-79dd-411d-a8c6-f12ba3236808	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.667	\N
6256b5f1-100e-4f48-9e4e-96a45c164d94	e0aed25f-f6d2-4149-aba8-e1746eecd85e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.67	\N
420a3632-2bbf-435d-bc9d-29a1d7b6faa8	ddc95e92-a0a1-4e35-b29c-ba9722aae19f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.672	\N
6cf5d6d1-6bc8-4fc4-b528-ab8b1915ffcc	d41e20df-d46a-44d2-aaf2-58cdc65f864e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.674	\N
5cb838f5-47e7-4407-bdc8-f04d367674ce	37abfb43-6d46-4549-aa44-2ea1f041ba62	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.676	\N
dd19561a-54e7-4b98-810f-1ec9d3e67b9b	888f94b8-d3b5-4952-9890-9cedc4d64d5e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.678	\N
cb742b52-2512-4873-9032-6aed4f86a12b	eedca5b1-c3cc-4956-89cb-e11b129fe80d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.681	\N
f5e44f42-720f-404c-9998-6a203a06abcc	9028aa67-3457-4579-b186-85f715df338e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.683	\N
4beba7b3-1841-4a6c-b91d-ab7f21798ab7	d3e95eb6-b4fb-4c79-bc42-d087f782b8fa	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.685	\N
53a7ce08-6225-418e-928f-8c1402f93d12	39d0298d-fc75-4907-9f8a-9e39a022f8ff	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.687	\N
314e81bb-5972-4f5f-8e59-4197ca4acac9	5269418c-6902-42c3-8b8f-ecb98f89ccc6	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.689	\N
9d4fbc17-c277-480f-ac8f-19c5d06c7dac	80d444a3-a514-457f-b984-3f09a4426e0c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.691	\N
2839c0a1-4557-4931-ac4a-a11ccc37582d	fbff8f3a-1a06-4844-a095-11fb200ba8ec	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.694	\N
336975cd-f1e3-43a7-916c-f02bc56a8c8a	1a80b089-3702-4a1d-b827-a6cfb9893bf9	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.696	\N
b3a9b8ab-8341-4b4b-b67d-b10fd7a82da4	5cab90e1-11ab-4005-87fd-280b8c13b5f6	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.699	\N
19de1d8c-c2b4-49f1-89f2-437d47f1bb5e	d7405b40-c8f9-4fae-9403-825b8bd66ce9	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.701	\N
eba7c1a5-97f3-4ebc-937d-bf00f409a377	888c9f65-4ef5-4754-8df1-5a3fcef7da5a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.703	\N
954777ce-8b11-4be5-aa08-4216cace2b90	c1ea28c9-c3f1-4a30-b9c6-6d1cf60827d6	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.705	\N
dfec8276-eb40-4c10-9312-b7ccb0f3b9dd	afd1d6ac-bfd8-4944-84e7-716621824647	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.707	\N
05af7c76-d531-4ded-9fb7-576398482375	c71591bf-6b35-4688-8359-04aa268a36bb	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.709	\N
a37311e7-8261-4f88-83e2-4b3aa8d0f375	846a243f-6c1d-40f7-91b5-4ecbc5b61ff3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.712	\N
80f73c4e-4476-49d2-b54a-cd999526d932	135e2781-59c9-4be8-9691-c29172d7b7e6	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.714	\N
f75828fd-c189-41ab-903b-af773cfb0840	d8dd308e-8510-4ad9-84fe-d5fab2ba0762	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.716	\N
f9d519e6-9ae5-4a97-b12f-64ee15cafc88	dac223c3-6fb0-4d4a-ac35-865a60503fa1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.718	\N
22675e83-667a-4a00-8734-f663c39cc4e8	9bbe1746-881b-4857-b9e0-29ec01dd1be3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.72	\N
b7abcdb3-e1eb-44dd-8867-b2fe01c614a0	d850b661-ab65-4bf8-9c44-417cbfecae7d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.723	\N
50168420-9ae0-43ab-a21e-a944838c0d53	0468a4eb-8db5-47ae-a5d1-512c49522f9a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.725	\N
e632330a-91b1-462e-a69f-b9a7ff14908c	2502851e-2397-4339-995b-05e9a6c96cfc	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.727	\N
ad592bcf-9e34-432e-bb3e-263d0e082b91	d6195b84-9646-4ff8-b82f-77bcceeed3ea	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.729	\N
ed49c6ee-8566-4d73-8c04-5d0ba24e3411	ed62fe46-4d28-405e-b761-fc0946faeb9b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.732	\N
323e509a-6bf3-40b3-910f-5297561cfc48	d4c31ba1-176d-42c8-bf28-47a79a717b4e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.734	\N
a67a26dd-e90f-47bb-9920-211c5524e0e7	12655fb6-5e57-4d0e-9673-d9f4fa6ea13e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.736	\N
ffa5578d-2abd-4aa1-b972-7a024721f398	067820b8-9ff4-4254-9d35-d0480dd6894f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.738	\N
82d594a8-7505-4941-9638-dbfa9ec33409	4eca6831-f29b-4c6e-82fc-df3e4b473978	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.74	\N
f820ad00-af53-420d-83c4-5d217c34f4dd	21418faa-413d-4bd8-8be7-f06176ac383e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.742	\N
adad72aa-332b-499a-be0a-459e7a38828b	491ffff0-6284-4dba-bba6-36f1754faac0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.744	\N
0e3cdb97-cf15-4625-8320-4034d7a19964	3cb1317c-cdfd-42e1-b1ae-77fd8183adad	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.746	\N
f2bfbad0-223c-4479-8e5e-d93c53541111	2213f48c-3627-4df3-a64e-4c7566bce827	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.748	\N
34cacfaf-7bd8-4aa0-b111-079ae76f31ae	a7a15689-daf6-4c78-9716-ad3a4ef32642	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.751	\N
90a38cbb-49dc-4053-9fb1-15bbda3cfbf3	d32be25e-9fcd-4cc1-978f-411a1d47f685	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.753	\N
43b0b771-bf15-4963-9a7f-185d2d0a2840	d096a0dc-306e-4b80-b86f-ad92e18b7040	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.755	\N
95d9d146-f61b-4917-af1f-e43510710180	2295c77d-258b-407b-8aec-9fcfe69b6e36	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.757	\N
87e41be5-35eb-4e75-bc8f-b3080ae3d444	7da6806c-77e3-4ffd-b649-0aed73270dd5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.759	\N
26fbde6b-1068-4e53-8bb2-772604aaa496	00910679-2f14-4c54-856b-d37dee44836c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.761	\N
666270e5-2431-4e9c-98e6-d3af606f2ac4	9308e713-4f65-4f65-b67d-53f1b72fd797	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.763	\N
93e4bc17-dccf-4e44-b905-40e40cd6f8bf	ede20864-36fb-4cbd-a251-0d5d5f1900fc	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.765	\N
6d4a673c-806d-4516-9c90-835e9b6725a2	e3dcbb8f-b1d5-4f24-8539-add933f52179	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.767	\N
4bd9be62-7eae-42bb-b1d0-9f916f36535e	8f764057-6942-4f1b-bb53-2539bd0cc51a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.769	\N
88059b0e-5099-4727-a51b-54685ebaf682	eb35614e-6e09-442b-8dc1-8da596eaad1c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.77	\N
fc6fccaf-7147-4308-b0cc-dd0a642f7dfd	7b302ed1-84eb-49da-ba0f-333bb89fbbd0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.772	\N
e5198436-5d5c-45ec-bdf4-69a59aacfe72	e71579c5-d23f-4f2b-8e46-a0534cf398c4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.775	\N
4a0b12f2-b50d-4a88-b177-ef5c8a78a9eb	adadd49d-8c58-407d-82a9-d0f338e7da97	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.777	\N
c0edb15f-05d5-47cd-8d13-2c9595102233	082a80e4-6af5-4cb7-ab88-9f1a07d90a9a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.779	\N
e93afe2f-b21b-4f70-a641-b8e8d8ed66c1	fd6c41fb-0549-4067-b60e-6e0c075f5355	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.781	\N
c3e6c53d-9de8-4b27-af09-2c765baf775e	0134d67c-842a-4118-abeb-381883bcb231	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.783	\N
f7a65656-cebb-47b4-867b-d1516f88d45e	3ebb99b7-929c-4797-a3d9-0458f7110b08	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.786	\N
07da6b43-ef9f-422f-b8e4-37777228cce9	61eb6f51-594d-4ba3-bde8-64b91016c67c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.788	\N
daaf85d5-bca0-4d37-9a48-7dde75aa9b98	fa57285a-dbb4-4e53-a502-7b434f08b929	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.79	\N
7f9ac5c4-56e2-44a5-bb3a-b7c0af68e079	3075980f-7cf5-4cf9-9f57-9c37d8e1ad70	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.792	\N
5f904394-d96a-4a19-9d52-270a824e872a	4bda9025-5e81-4527-bb38-09bc6a2f56b2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.794	\N
1505dca8-1179-498c-9455-07f08b9a4537	1e10acb0-7ce6-41c6-bd65-82ffe5262ed6	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.796	\N
447616a3-33fb-4983-a2c7-21912ce3be9a	3a73e06e-fdfa-4587-b7f2-2925a2d97ed2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.798	\N
cbd35033-ffff-4c73-b5b9-2e9eaba665f9	2c16f777-9745-49c9-998f-18085e902c5a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.8	\N
38485555-4620-4fe9-976b-d92232dfd425	4c4d38e6-8cf6-4afe-bd28-da5ce824389b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.802	\N
b9a83c3a-6edb-45ff-a7b0-f36477199245	b27c919c-1ffa-4482-b6fd-954c47909cea	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.804	\N
1a18631b-1fbb-4c60-9c0b-e74fcd4e4eac	00306aa5-fb50-4059-a5e3-b1263bab6e83	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.806	\N
63bec4cb-dbda-4232-ad62-9dfa53380805	73bd1e2f-3448-421e-8c66-888af1665ec1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.808	\N
6772bd18-044b-4f96-bd73-d0363ccd8998	8f53a40f-187f-420f-b938-908a90b92b56	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.811	\N
2a4935b9-e4da-4602-bdf3-59f55eb5e16d	e65182ad-226f-45c0-9908-06bd5cecd5c1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.813	\N
26b73ddc-b017-4c67-8917-995d9e3bc9d7	fcfcfd6b-edbc-4393-b4cc-d93152c73426	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.815	\N
94a66d62-d59e-411c-84c1-3520031faf28	0d2ccf2f-93ac-4cf6-97df-4e8f81ee174a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.818	\N
95619314-95a5-427d-954f-763fd5c99b4c	a1efe9fa-52bc-4611-aa41-c46dcdadf8e3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.82	\N
5a6a5be3-52bf-49b9-961c-9e27fc834fe2	a6717ed8-120c-489a-bd17-4e65171f4424	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.822	\N
6eae66a3-df62-4f41-b9d4-0a50a1045f8e	b1bc7691-239f-4eba-807c-b951ba622951	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.824	\N
dc930db4-c848-4da1-90e6-748c4bf97a57	7f02983b-8824-423a-b18c-d4cf9150037a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.826	\N
9885975d-e0dd-4554-a32e-a2c0d1afe8cc	3aeaa205-aa59-4545-a9b1-7fc517b7f45a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.827	\N
230d2f55-f0e5-48df-a4b7-a341516415bc	1c2d1e53-e6ee-4acd-8591-a85d7fda934e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.829	\N
6d766029-bcbd-4bde-b019-966c1aa0c824	5ed5e57f-32ed-4b74-824d-0c400b4878e2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.831	\N
c2f592a8-30ff-4a81-962b-42709dc27eea	add2c1b6-89bf-46af-9488-196074022df7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.833	\N
6ff10b5f-930c-426c-b8a7-aa90c97e208b	cc2c4a84-d365-41d9-b6e3-09ac2bdbb715	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.835	\N
3d971386-9b0b-405a-976d-a7e97a133858	f8ebe04a-765f-4aef-a159-ae60cb414923	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.837	\N
6100e3fb-04d3-4bf1-801b-d732fb6840d2	b8d52358-98bb-46c8-80f1-dd154c601e9a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.839	\N
ccff447e-87a8-4471-a184-ad758a2444f9	eeda8ee1-934b-459a-b375-9c4ef537f996	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.841	\N
7fcc6aef-fdc4-40f1-a60d-b562a6e45d9b	ba4b9fdd-5d40-43c0-85ce-9c85405c429b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.843	\N
7e885830-b514-4b9e-b848-4b2d005c23fc	afc67c71-f061-4c59-b608-8ad26c0ff00e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.845	\N
ed2a62d1-f941-434d-9935-d48044734c53	c9b827fc-9875-43a2-bc6b-44f4b03bb9cb	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.847	\N
e2e1f099-454e-445a-ab2c-c4cd04afcadf	588a2b79-7eff-4f8b-9348-90d22f1b9352	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.848	\N
829197e4-8729-4606-8047-8388ccc43c1b	511772ce-fd4c-44c5-a331-6bc7b8383d2c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.85	\N
7cb7805a-0f0d-40c9-9409-a222ba940ba8	07f6eb6f-0603-4f0f-8fa0-61d2e1bdfe61	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.853	\N
510ad43d-647f-42bf-b154-ea418529be19	0ef3bd2d-9037-44f8-9625-fbd97c31f899	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.855	\N
16011bf5-b230-48b3-8290-ab9cd5daf35a	e7f215a3-d9fb-42e0-859a-6816a57a4900	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.857	\N
c8296839-96d7-4a3b-9d13-88b84b3238d8	ca8b34be-79be-49cb-b0b7-575809eb14ce	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.86	\N
b495e245-be32-4763-bc0f-637a1d8c88e7	a3859333-30da-4871-aa6b-24601c0f6d1e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.862	\N
df35be09-8d05-44b3-a5c0-17a865436ebb	f59a269f-a8b3-4220-b1ab-9a18e2525c30	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.864	\N
482eece0-9880-48ff-8dd2-787e51c1f973	105c2fbc-6cba-4799-bdd9-5c7010f16344	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.866	\N
867684dc-1b24-48ae-a3ee-40e32385c222	3426553a-04fb-46dd-ab15-47d78fc9781a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.868	\N
c0f4b1cc-cb2e-48c8-a7ba-f49c3f9a355c	3f88c16f-3303-4046-b9ec-24e5f43108f8	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.87	\N
5ebcd568-bfde-4495-83a4-4c1c5a606bb4	2505d7a3-1c17-4e8d-aa5b-d02816a52837	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.873	\N
ed893c13-c39e-4e68-b52d-aaba31a9f0fa	463516da-8bbb-4389-82c9-c5f566dc5613	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.875	\N
2c509307-ea95-4f80-af22-8d1262870d40	7bae00c8-5abe-4270-af1d-ef8e7cfbbc9f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.878	\N
29de9405-8568-4696-8a57-4820d878e41c	f6a41728-a7da-4b8d-9d7b-53c429403e2d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.88	\N
e7716ddb-8b11-47b7-a4ee-307f1aacefd5	260cd449-17db-4f35-a9d4-3181040802f2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.882	\N
47a080d0-1004-45c2-8b0e-0e03bf8b9278	cef6dbcd-2658-4ea9-9d0a-d8d7d01cc368	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.884	\N
b7a3b976-5f5a-4171-8cfa-83c214f5bc29	b8297aac-e6c3-4353-8510-da4efadcf98a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.887	\N
6707e46c-2e6c-4eb8-81a5-bbe91a8524c6	504799aa-420e-4d1c-9822-38d849f64d48	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.889	\N
21aee804-0f48-4d9a-b890-67c3a77c3c95	5dee13c5-0c39-4244-833c-6d9229d338db	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.891	\N
7fd7b8a4-97b2-4282-92a5-19d8e7bb7e30	7dade6ed-4058-46bd-9330-9ac7291c904f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.893	\N
ea7785a0-f27a-459b-8751-4b14e90116ab	3779415e-c95c-4978-b9de-4a3ebb4c0730	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.896	\N
ac5557f3-60c2-46d2-b0a4-723f165e9932	48f1f170-fdef-4247-9763-4a5132df7a97	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.898	\N
497fb740-861e-4ab9-aba6-c83452e8a94d	ee8eaecf-01b0-4953-bfc7-c1a5a76af4b1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.9	\N
f11c152a-f164-46b3-a876-61175430e805	4964f270-580b-49a0-9d92-a12e05620ff1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.903	\N
fbcdada7-7d6e-4e21-9c3b-a235e1a89565	65bf9900-9a6b-4336-8b1c-ab03f6328732	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.905	\N
046e3154-7b78-4075-b4a0-4fb5d2b69706	def04071-a730-4082-a7ac-7ccce0ae78e3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.907	\N
e9406491-49f6-4cab-905b-c99740705229	fe8ca978-ba16-41de-a77f-216924481d59	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.909	\N
f2a47c63-40fc-4c1e-9ca4-61797d290b48	87a3092b-c75e-48a1-ad3e-ed8ca0f68560	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.911	\N
e38a7742-e9a5-4685-84d3-d253d5f68be3	0f7be09e-fe06-4e49-bb80-e356b311c313	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.914	\N
72595590-4cdd-4a08-a8db-4e68842a6763	4b346bde-e4e4-4463-8d37-667f6a6b287e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.916	\N
bfc1ce09-ea61-45a2-8bfd-ff533c33a30c	21439224-50e8-4d03-acb0-eb6b5a0d6ca9	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.918	\N
df5e858e-1653-49fb-b4e0-0b62d21db75f	bbb8ca1a-0ce8-42ff-80f9-733d7741de6d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.92	\N
a769a375-ecd7-4a50-ba5d-12ad3972ca78	ad805e58-2043-4c88-b110-d8e8a2153a10	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.923	\N
e76890c3-2330-44f4-bfd2-01cb488f2fe5	075a4872-bef3-42d9-a88e-d66a5b9106b5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.925	\N
b49a6adc-c6f7-4ff2-a84e-d1f733f8935c	48c9e762-5770-4337-9b39-67e41ecdc779	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.927	\N
01597da0-56d1-4824-912d-2864c4e325b8	30b6d058-9753-4d56-bc2f-cf474c59e725	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.929	\N
cc178cdf-5136-40e6-b78c-51980d6cde5e	36834391-edea-4ac8-b6d6-9bc01a981fa6	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.932	\N
4c9ec228-73eb-49d6-a5ac-ac37f9852b79	81d39341-3bdc-4e81-b553-1c65b96f8f7b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.934	\N
23ed0fb3-2980-41ad-a211-2f27261a8ee3	c51b93a1-e85f-48f3-ab88-02c24991179f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.936	\N
dcbe7e87-a785-49d4-8128-92a058b13ea0	6677ba31-52b6-401f-aac5-4c3febe1e05a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.938	\N
b2005fb0-aaf7-4b5b-9248-ab628bdf636b	17236137-05eb-48ff-85e4-13e53d4951ee	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.94	\N
62fa2985-05da-4613-abd7-9157870cbabc	0a3c100e-96af-418d-a63a-64470a954bc7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.943	\N
94da898a-dfe0-48d7-990a-ddd06c6f86c1	d06344aa-ca52-4e9e-b1b0-c345d7023276	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.946	\N
f142cb1f-0a0f-4975-9fee-57e7789092ae	12465c92-3dda-4b98-be60-75a7f7931328	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.948	\N
3d470225-0022-4bdc-89f7-99a10c36abf1	004cd5d4-8b9b-4cce-ba59-46e7f5058c49	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.95	\N
39e11b45-5544-42e8-a315-453779bbd131	8f49487e-4a59-47d9-b11b-a7f404651ea8	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.953	\N
b5486d1c-bd4d-4607-9461-d887848af58b	1b579721-6838-4807-ab10-c94520226066	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.955	\N
2ade5496-cc5d-4b48-91fc-5e025e06a405	bb17aebf-64f2-4fca-b185-b40508c580ac	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.957	\N
25ab0111-a52f-4169-9e45-08a40fef8a4f	eff519a2-56f3-4f3b-9433-09277dee7199	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.96	\N
7b341092-db7f-4c5c-9be8-4606081a330a	2d6bccd8-7ceb-44e1-a129-588f3c6ab844	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.962	\N
246421ee-8f4f-4f35-9be5-251eb5351e01	a084a1d2-4099-43a4-bb21-d2c3fe2d9df3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.966	\N
2db2ca7a-11c9-4adf-8b8e-4c5fe61b5dbe	4e39a65b-9d0c-498b-9738-91c3bd6a1adb	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.968	\N
15a338a5-44c5-4d50-884a-649947128b0d	30ad7410-88e1-456b-8b50-5e721e6cb897	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.971	\N
f762728b-a477-409a-9bdf-80c430932e77	ee3d8f5b-bf75-4037-ab62-d828de401739	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.973	\N
d111c06e-90ae-471e-ba1a-0dc349c4dda8	6acf6bfd-afb2-4013-9474-13ed3625b112	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.976	\N
4d58eeb9-65ef-4348-a4f8-ec244146753b	062b2823-f349-4938-bbb3-050a10366789	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.978	\N
07d456c3-5652-43f9-a34f-cb478a986ca6	178270a4-196c-46d9-9b18-255bdff30f0d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.981	\N
7b5786e6-63f4-4452-892e-7dca6dedfc91	5c60f228-3dc7-4c2c-a497-3a581da17657	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.983	\N
6dfdcffc-066c-4686-ba8b-6cfff2f874fb	d17136f1-4d6c-4b04-9f76-a71823312be7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.985	\N
27b347c8-ac0e-4d5a-9dfd-254a8924c93c	e74fa0b2-dd34-4231-b1f1-4e55eec2e3aa	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.988	\N
0ca283b9-14db-4919-aacd-e8a92475c4d7	541579f4-199e-4bce-a403-9200f7234a92	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.99	\N
6569fdcf-829e-4527-a68c-7558f28bd3d3	5c18b032-73db-4214-bd59-4d5babc51ee2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.992	\N
d5224ab2-4551-4183-91c7-5e5900c745b7	3fd0ec8b-41ca-4420-b27b-22e79138555c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.995	\N
477b215c-8ad7-49c1-b855-b90f6fdcf84e	731b5b77-01cb-41fc-8fe6-db850dd4cb7d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.997	\N
a7dc9a1b-f122-4aee-bb8e-93a13e56f2cc	9d788767-8c11-4f9d-9730-eb3018584be5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:35.999	\N
aafe31a6-6b39-40b6-8da0-bb4993da577b	22bbd7e9-d1a6-4b0f-bd5d-96ca66b43f0e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.002	\N
93b0f551-3e38-4820-8b3d-3af681dda0dc	f9374e41-8456-4ed3-a8b7-0bb46018f45e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.004	\N
e5b820fe-e577-45fa-b949-1585cd871ea5	fd503ed6-2630-4e0b-b296-4f253e3ddd0f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.006	\N
72b1341a-1ca9-4a4a-97b5-3895e66dc769	31ce6dba-263e-4c25-9dc8-8a197dc7870a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.008	\N
6895fa5a-cb44-4802-ab0a-b10b7fa74872	3a80c426-c2cf-41ae-8149-0457f59d78f4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.01	\N
b8e6a568-dcd1-4adb-8488-4aa8a7400952	68079424-0606-41dd-b556-aef03edf0699	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.012	\N
1f998c7f-3737-4188-be99-b245a10d668e	04b8c71c-beba-48be-a247-0da5665e3b2c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.014	\N
883c0e6f-3425-4fe8-a101-e690a6ef5758	677fa809-6fc6-4d2f-bee4-5b82484c628d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.017	\N
7b10a9f4-6421-42b3-a441-734937bf5f26	55d8ea26-b50f-4c0e-afb2-a9006785a13f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.02	\N
f7e60acb-e736-4965-b768-35aecfc18431	3807d35a-60d9-421d-be86-941359363c5c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.022	\N
0e9b21f5-4071-4d26-9743-828dcb1888f2	a93c08a3-ddad-4509-b3c4-d69a1127aab1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.024	\N
b01f33a1-b99c-49ae-a159-554ec43f2248	693ccb4d-b999-4112-8e04-4a1a90cd9f14	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.027	\N
8ae1969c-31b6-48ab-83ad-20b9ee3c9ff1	5f8c4af5-dcc6-4850-8b60-0c3d436f8b35	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.031	\N
8f84818c-97a0-4f7b-ac04-3347c5548c66	e06a4c74-f1f1-420a-97bc-16c6d39c4a78	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.034	\N
ff864e6b-7aa1-45e4-82fc-afcecc55760e	e06beec3-0dfa-413d-a4a8-0208edae8aaf	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.036	\N
7f74b561-c45b-4b0c-8499-14d2545203e2	0e73a6ff-7b87-4b18-b23e-4c9b4aa3acc4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.037	\N
71878132-8e92-4248-b17c-f74228f7b301	c95f967a-a749-4151-95f7-c40a90721eaf	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.04	\N
39ede92d-4b13-40c0-80d0-9f6b18f0755b	4696ed92-abc8-400c-924d-6c25c22b1921	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.042	\N
f12412a8-8583-4e55-b570-ab5490dff67e	3a3c3261-e5f8-46b9-81a1-61b7183914c3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.044	\N
71fa04d3-d970-4785-b71f-8d1a7f28147b	98544e70-9e4c-448c-84a4-a78af6059040	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.046	\N
c123b533-4954-4f1e-9b09-415e7a2c71ba	e3abac04-86e5-4a43-8263-13a5578c9e2d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.048	\N
903d0f00-f55b-4c41-a03d-a1082e9cf47d	4a5aab73-ccba-4b22-8501-27143bbf70ba	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.051	\N
6a1d6f03-5d06-44a8-92c8-1b5cc9698306	1dd78cdd-abc1-443a-a28b-52e17ce97ec3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.053	\N
2ea401c8-b34a-4ae2-940c-6b36016f0870	91077608-c7c3-448f-ae1a-61e738481583	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.055	\N
1230939e-b7eb-4a8c-8a02-97877db6ef8f	c639d61b-0eaf-4da3-99c1-662f4ba8c952	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.057	\N
6903241b-272a-46cb-8e31-2a4565d07fec	7cb7f9a8-c266-48a2-b114-485290249373	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.06	\N
a87a3ef3-21c0-48ca-90d0-a6e5e8949b29	98e20ab1-0a6b-4035-b733-b38088c05cbb	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.062	\N
14d2e4de-f82f-4e12-a0ca-953587076ae4	80289dcd-94ac-481f-9f43-1c89e9bfd67c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.064	\N
5fe259a6-033e-4c45-8f48-f05264fcdc0a	77697c85-85d5-40eb-8490-d4bcee151a54	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.066	\N
97ea038e-7aab-40f0-b064-5904917a2443	a93fc25d-313d-4520-b7c4-f5759a72ad7e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.069	\N
7cbe1a62-c688-4288-968c-58953773f13c	72d7db31-5c99-4996-993b-fb715fd2066b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.071	\N
cc157501-80dc-468c-b903-4509e6b7e6ff	c82b7c98-bfbf-48c1-827a-6cdf6a89fecf	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.073	\N
9363d6e1-7206-46dc-8a60-aa63783d313e	4310cdc3-b7a1-458b-abeb-cafc9a7a8eac	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.075	\N
650ed886-11b1-4e3d-8195-34e220b66f3d	eb8415b3-83e2-4e76-bc3a-bd55a8b9e605	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.077	\N
45841b62-6de1-4a20-bed7-7ed2680e5ef8	b7d8117c-bae8-4e8a-8130-c24dcb219121	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.079	\N
5558eab2-9f57-499c-9ae0-7cffd26c6b90	83460e90-4a9a-4257-b794-5f755488d3fc	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.081	\N
c5fc3a6e-9e00-4699-b89c-74d1daf87c88	b38fe524-a9e0-4180-9ed9-cacdf412c188	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.082	\N
9f6fd75e-9718-4b1d-919b-f4d912c3285d	9b893fa9-ec99-4dd2-a774-1659263b36b2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.084	\N
c955d2e3-84d5-476d-b37b-26d12862a470	75067de7-53f3-4672-a795-53535615ea4f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.086	\N
c4d87c08-03ef-4fd2-9073-4034b0e0aa6b	884f5e2d-057f-487a-ac78-07396f8a51d9	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.088	\N
cb42e5a9-20d5-488d-a7e8-1bf089b6a608	c1a620fb-1726-4dbd-ab4b-ef369a1b5411	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.09	\N
cfc5cf96-0b62-4644-9143-2d25a78a1fe3	d2c64876-0a14-44a8-b221-30eef5e960d7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.092	\N
7a629cb7-af77-41d8-8002-0e6437bdf284	db638bad-3596-418f-b92b-2630ddb0a012	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.094	\N
f93fd61c-fe3f-487f-bb7a-a9fc6ac654c4	b1133720-6a9c-4067-bc7c-363bbf46c4ca	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.096	\N
50f3b23e-cf72-4d61-b3dd-ef07b9947f6c	cb9f9a33-a101-4abd-87f4-8ddb8ecab029	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.098	\N
f200e1f4-fa86-4ef2-9db7-768f91ec4c65	4173970d-a88c-411d-af42-9da922877757	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.099	\N
0b69dc92-0e99-42e0-9f58-8a24e0648eee	3f18c36f-2481-4a14-aa62-93ca7f8f158b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.102	\N
fb26d92a-600a-4437-9628-c7700b1955ae	fa068abd-63ec-4a82-b5ef-c214be64a85d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.104	\N
aaca0ba1-5b62-4465-b0cc-1229af27cbb6	3a756d5e-65d5-4d27-ac97-404f47dcd5c2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.106	\N
7256690d-f92b-4b4b-862a-899ac8e677ed	d1fede23-a413-444b-9888-1c2151dd601f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.107	\N
6e1602f8-fda4-4405-8d77-4212dce56980	c3a75583-ff49-4b8a-85e8-5e96a1e09b87	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.109	\N
61349106-9012-4100-ad12-8e9dc0ce75e5	d28f3a9e-5905-49e9-ab99-8a387241fa4e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.112	\N
6c41ac7e-6e00-45cd-bc3f-419e1ac7a1dc	2413cab6-e99a-43e2-a336-cb67aefa936c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.114	\N
6cda6d5c-3226-43cd-b16a-c8861ebe6264	84b67757-fffd-4db2-a4d1-b94cb354a230	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.117	\N
756f7a38-5348-4ca8-bf19-d1ee64c3e967	30a47a8e-58f3-463c-842d-b4856a84dc6e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.119	\N
74f779ae-b399-4553-a3d3-9600263ff765	08da5992-f54b-4ec1-a6a6-f75a6815acbc	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.121	\N
c84a0f0f-0bec-4f52-ad47-17fd62826306	5d515fc8-a582-4730-963d-4fd850f93230	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.124	\N
ddee7dd9-6df7-4b09-9cb3-59d4fbcdbbba	c74bb7ff-a068-4dda-92d0-d37850aba89e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.126	\N
0f4e04d8-c918-4d22-b919-a8299b43f2c7	bac43968-7ed5-41a6-b2db-71f484d5b247	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.129	\N
3e3f878d-2b96-45c8-9d8c-77d62733085a	bff5eac3-61c4-42be-8330-82f6a16efc06	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.131	\N
b4938af1-26bc-40c1-a47b-2f0d66417268	48b1a555-8bae-4e57-941d-7a6c4d652ab5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.134	\N
cee520ef-2a8b-4cd8-8169-9359ddf70f86	cef472dd-982f-4e6a-8aec-a7c5022e0c24	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.136	\N
29455d10-7566-40b4-8684-a40340b2c8e1	655f6e4a-de5f-4c8c-92a5-c70c376b7e5b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.138	\N
a82ca965-b5c8-4c81-a285-dfb433e8402d	3a303f53-e607-46f6-8263-8f2087eff8b2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.141	\N
88f68e72-4347-4799-86bc-c4091ab5e821	46141e72-f36e-425d-b712-b4c686f11358	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.143	\N
227d3dd4-0f2d-4208-abcc-822cc44344aa	b3208a12-ae96-4a4a-85fb-5bbe4c7fa562	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.145	\N
b7511d11-6579-4f5e-a7bb-66f1d4cebdf6	9fd76969-86c0-4c24-8063-69486abbb775	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.148	\N
fe4356bd-11e3-4ffd-9b31-cff75870a8ce	9502f3c3-bfb2-44c5-ad14-0af4b45c0b32	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.15	\N
e98bcf30-b735-4d76-b3f0-6f28c4f2beed	d6a41be1-b9a6-4204-8d14-1e686c5155b3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.152	\N
17831042-7c95-4bd4-9846-5552dcda6ae8	988d99b6-3b8c-4f62-9be0-9fbe14931160	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.154	\N
b07eae10-36df-4425-ba27-7e5b753876f1	b4b79eb9-4ec5-4f5b-8605-f777ec0243fb	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.157	\N
738e8a66-85e1-4e2b-a8d4-91b5ddee2b59	c7eed740-7432-4aea-a9fc-fccae506b94b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.159	\N
b8eb20ad-ae60-4dfa-9c6e-b98f1c82febd	8cbbe7f5-7df6-42e2-a3f4-735c65298803	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.161	\N
21265f3e-ebe3-461c-a4ac-0ce93d1a55ae	481232a0-acc4-42ed-a528-328017ab4611	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.163	\N
6a17ab79-4784-49cb-a190-af5785e27ef3	19cf2475-25a7-491b-8aa5-c90c29a86816	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.165	\N
66853cef-4589-4cb9-a13a-d3a8d70c9fd8	43b34baa-7440-4e75-8b99-f601f6131697	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.168	\N
3e86a990-1a88-499c-983a-c2848efd3a36	7119bb9c-1b11-4513-bf0a-6e80ba8b5e0b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.17	\N
6bac1ac1-289f-4a8e-85ee-f5ef42ff0b2a	cfbebffd-14c7-47ff-b0af-f3986b50b83e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.172	\N
0c5bd189-91c2-4faa-af7d-a617deb81d3a	93780bc5-7c08-499e-bc3c-11d10747998e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.174	\N
a548a42c-366a-433c-8b50-1241bab90ba1	19f571f7-191d-4c4b-a647-295303e0c700	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.177	\N
34f3927f-a659-495c-8361-317289228234	3d563ec7-aeed-4cac-9bff-8db285136eae	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.179	\N
887baf0d-1b86-46d6-9e04-4ec3973cd82a	f83b4e14-8c37-40d5-a480-bec2acf1978c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.182	\N
da478868-c483-4b21-b663-38fe3d120d29	e2657bca-1cc0-4959-8651-3f2565ad9985	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.184	\N
710e44a3-9a03-405a-b4a4-ed83d329f391	2301f98d-de4c-40c2-b33b-57de062d7242	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.186	\N
d3e08a3f-b7c5-4e0c-83ea-a8b47c8dfadc	6ef70318-736d-420e-aad3-50ddc63625c7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.189	\N
82d88f8e-57cd-41a6-bd37-9d6eadf5d51d	373453d9-2d1e-4757-90c4-7bfe0b4035b2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.191	\N
6d26efb8-b35c-48b4-b894-dfedc498be67	6d64a3a9-5480-4cdb-b574-2dda334ff5c7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.194	\N
01abbd46-0f20-487c-911d-1dd2b00b6b35	1d71ccd8-8d7e-40bc-8ef2-bde2a1d72336	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.196	\N
6c98b295-8a8d-48c0-a77f-506dece7510a	222e55a5-f4c7-4436-b6ea-f5893f6332ff	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.198	\N
4b241f9e-2e2a-47e8-beac-c8ee2892eba5	0af5873c-b759-4c19-ab8a-e9486df016ef	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.201	\N
7d1835a8-1af4-4744-a056-bf66f45ea68b	f4c10a42-02dd-4ee4-9f68-71c2b2d236f5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.203	\N
0ee464d2-dfbd-40d8-adc9-468dac7ebd95	9051a5b5-e8f8-465a-8993-3c8986dab2f5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.205	\N
e7f4a4bb-804f-4a81-b2f7-b767d6cdab6e	0356e269-58b2-4717-9697-2038cd7aec50	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.207	\N
1f28a8d7-32fe-4012-b34a-97efcdd35a2e	1e539fcc-86b3-442d-a4c5-4e18516dc95b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.21	\N
b8ececeb-a75f-4089-80be-7fd58911e3eb	77dba871-2d2c-4cfd-a6fe-7068608b10c4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.214	\N
4380795f-6771-4b94-b6c5-127c1749c619	28e8eae8-ff81-47b5-ba8c-6315ddd2eeaf	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.216	\N
bc825f36-215f-4a35-97e1-b60f7479b628	20c3ba5f-5e8c-4c2a-a0cf-e67754a8a73d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.218	\N
c2ccedac-34ae-4e0d-9de3-cea8744a7555	1ba04ac0-e09c-42c9-8097-e39295b64657	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.22	\N
1486f566-ae6a-4cc0-9f6c-20f4a987207c	3617dcff-9f4c-43df-8cc3-8b868d2a5087	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.223	\N
ef1ffd38-3ecb-449b-8e64-0484e08406cb	9fc154e4-e991-49f8-8acf-7e9748b48971	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.226	\N
f0894ba0-1f83-4c36-84c5-ecf859747168	bcc0c303-8b08-4c20-8485-6d0847bb0de2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.228	\N
c819723f-934b-441e-8403-3ad9c4c6f346	619a8c79-a93d-416a-81fb-b1da8d8f90fa	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.23	\N
40694b47-1925-4026-85de-1b3d0fe97ea8	06ad8a55-2ef8-4bfd-bff3-8a92046fffa4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.233	\N
1ffacfce-7bce-458c-bb2b-71e9e59d802d	f58694ad-39d2-4aca-a39e-44043f68c663	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.235	\N
78367dea-44b3-43e1-9125-58186f0edd95	300312db-5a2a-4ac5-9104-580c58747f1d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.237	\N
ada4f7f4-c1e5-4fb9-a06e-c426547cf471	c75422b8-ed72-48b3-8de2-d8998ca3efc2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.239	\N
6ddb81a5-1884-45bc-b49f-01b59bf28d50	359e33c6-aafa-45b8-a794-ef11ce6b065f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.241	\N
529fef30-8d0f-44d7-806e-db0d16b8778b	ff9d5f7a-3b94-49f3-8b43-986955b62c58	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.243	\N
25f06426-9746-4184-8d1f-234fd683fa74	bc9c612c-8f32-4254-8a52-42350898f127	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.245	\N
8b89b325-decb-4f0c-89d6-8188a3626e2c	9c5d3368-9d5f-4955-bd8e-68e7d25269cc	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.247	\N
361dbfef-b17a-4cde-90a0-e7ca239226cd	bbbf4ba4-01c0-4d49-a215-770e296c6b19	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.249	\N
82d75f15-6e76-4c6c-bb31-1ef0adc3d7f7	250f7924-f299-4c9a-8303-95523e32a9bb	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.251	\N
0b6e2499-dc3f-4681-880a-9780819d4343	39d05d1a-6cb3-4030-a001-c35a1ee01b41	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.253	\N
654b6bf2-7b69-4383-9399-2e06c79272ed	91d82b46-dcbf-460f-8503-681ccfeabc12	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.255	\N
cce8b1ef-d4c5-419c-986c-39fb26f3c59b	a842d3bd-5196-41b5-b916-3e9806c2d5e8	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.257	\N
cb63e1c0-e755-49e0-b40c-c4764ea22728	b01db441-d669-4f1b-8706-79eced477eb9	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.259	\N
798eb170-55eb-4525-9b15-493415855559	5aebe4d3-6888-441e-931d-96f2f96bcd93	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.261	\N
cca3f7c8-a9d6-45eb-9a13-3775b2747ebb	55a247e6-fcf5-4eed-94f0-7e2fd8d2d5d9	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.263	\N
5e0f7baf-81c3-4fcd-80db-41979adedd8f	466a116d-7b68-43f4-9d0f-4cf0ab6c8a50	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.266	\N
87f05e31-cb62-4c73-9da5-5e74d53e67df	e95cd301-3cf4-4451-9759-3f7f1c78b44e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.268	\N
e144a21c-58e8-4673-a750-ecc583b18b0d	ead09ec5-ba0d-4723-b821-68936d6a2603	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.27	\N
daff93fa-7b73-4311-a926-541ba078d3c9	458b9cc5-9c59-4f0b-8e8c-ba6fa94349b8	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.273	\N
a08f1756-26cb-4307-9995-2636f49984cd	a79bc278-351c-45d2-bcc3-f46d6214d1a4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.275	\N
7f9c7385-34f2-4458-a6fd-d05ce5036c57	442f347d-e44e-4dd2-ae66-0b8c6d5aeabf	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.278	\N
519da3d4-0b88-43b7-ae16-d1a53297ef4f	ee06071f-285d-492f-97f1-38f91fbeb2b2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.28	\N
d98bfe74-2e20-4fd6-8736-aaaf4ae7b8fa	76fbd65f-50ab-4b55-8e3f-13005802fb41	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.282	\N
fd20f178-71c2-443d-84bf-81712dbb2f95	c3adfefe-6511-47b5-a244-c6007b811f1b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.284	\N
09c1c68d-24a1-45e4-b84f-b512838e565e	4a3a1173-7f9f-46dc-ab48-a99f720a9ed4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.286	\N
11ed5b7f-7364-4a7c-a436-3050f65e3a0e	138bc20b-fea0-4c18-b3d6-9b499c993892	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.289	\N
52671b77-1c82-4fa5-875d-f42ec2acdf60	b03f4014-8e48-4cca-ab1d-aad971fd6daa	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.291	\N
f065eabd-3bef-48f7-83fc-1ce1ea1051ce	069e0d9a-3113-4ce6-9cde-16b5e0accb9d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.293	\N
ebb2410d-c0f0-4091-b53a-824c25b62046	44a407fb-b3ea-4f30-bb06-223e44ec02b1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.296	\N
3c44037c-004c-45a8-a644-a466c2611f09	8796bac6-6ed3-40ae-af7d-fe8bce2df71a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.298	\N
e2e22d5d-1328-42b1-9b1d-4ac6f2c139fc	c4e94d89-c820-4c6c-9514-df1750663eee	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.3	\N
3763b850-aa05-4146-bad7-89d1f2d855f2	c6dd6792-e6cf-43e3-8b39-c04be6d1d7e2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.302	\N
cae825eb-d1a6-4717-9aa7-ba39d63e3991	07e01d17-5603-413e-8621-cb2f8f939c9f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.304	\N
142de70c-58a5-4326-ad4d-351e6dead552	2aed10a5-6362-4e65-a640-e913483640ec	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.307	\N
52cbceae-3e66-4ffd-82cb-fc67252fa7e8	8342af79-e77a-473e-981e-faf6e8cf17f3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.309	\N
d99411b7-1e54-4e98-b27b-0ee5643a6953	1fafd37c-c599-4b66-8aa3-805d41774fc6	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.311	\N
e1667fbc-7296-4771-8637-54b8ee46c1a0	8d95975c-fbb8-42c1-bda1-5474a1bf55fb	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.313	\N
4f396cdb-387b-4b30-a405-0c09ee7468c3	ae64a2c7-fc0c-4e5e-988a-3b14a01b8b63	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.315	\N
6cac5538-256a-4ffc-8e6e-db79984493df	81585f49-6d28-4ae1-a272-827459c6a21a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.318	\N
f158ae44-3598-4efb-b247-653d84fbbb48	5933b763-44f1-4984-89ef-160c3e9f0d52	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.32	\N
76a4b457-b99c-4b06-947e-352461da18e1	6923c90b-ac03-4f4a-b2b8-87803eac7d11	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.322	\N
e92e3bf4-6729-4e59-851a-988fc738820a	c14e2a78-3004-4c82-9acd-1cd68ae30a20	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.324	\N
3cf414ed-0ade-4946-9333-7a8003dafab3	f3ce97cf-acb4-4e35-bf09-c6a866507236	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.327	\N
181f350d-2c2a-4df0-9270-1b8624f91eab	2ec52b0a-ae26-404f-a4ce-d62026d59811	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.329	\N
9ec995fa-ebff-4a55-9d09-9daa625d9fd4	732ed3aa-aac5-4378-8ae1-af6885111155	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.331	\N
7a611d1b-8434-496c-86fa-2c28cf9e0c8f	9f5df180-82cc-4943-a434-1fea198f8144	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.333	\N
48d1a412-36de-4f1c-abff-12290b2815e2	fae1d261-8929-47c8-a976-5d16b153355e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.336	\N
9a85ee6c-84a1-4c60-80a2-1253d397f001	1300e6d8-8303-4577-a056-ce7575403f36	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.338	\N
75376d81-c63b-4c7c-8b70-d0e9270a7392	3a51db9d-3759-4d8c-9f79-aa28d5473f78	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.34	\N
5b39a57e-bc57-4f79-a77c-1fce2526eec9	a3dcd59d-8be3-4cbe-a671-9977c29db2bd	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.342	\N
e2a7efb9-8eb5-4a50-bdad-9499f6c43e2a	e70635fa-7b4e-49e8-82f1-50cb53ad4c0c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.344	\N
2cd37e5e-2098-4cc8-895b-6a8c8a052a9a	e8541c96-7733-4952-bde2-325bcf927adb	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.346	\N
205157c4-abda-4117-9548-80530576b740	bf1cdf3b-033a-4215-8edf-4e4911e149eb	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.348	\N
b68e702f-9490-462c-9e28-1ec186d84e5a	20eccd50-ad0f-4ce1-b5f8-305dbeeafd34	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.351	\N
391089e3-8dbd-4f0b-b0c8-2e7c1c1fcd70	9d1a4065-b3c4-4518-93ba-cfe6b47774e0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.353	\N
58f6c4ea-69c3-4676-8655-154c42375092	9d9f700b-bee3-4d1c-897c-20eac438e94b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.355	\N
d44ab74f-f716-4910-af88-ed2b87154c68	5f25ba33-fa87-498b-82ce-1863dae9132d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.357	\N
052aaad8-4d04-4acb-96c0-dd75000608dd	196b7ecb-7847-4a4e-84b8-0a72a534ba27	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.359	\N
426c35fc-6562-4a15-af77-391167b47274	e234ab21-67ea-4885-9302-663fd2340d98	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.361	\N
fd38be10-ab14-4dff-8f39-d4e19d825c55	264438dc-0a30-4d09-9e23-84317fc60747	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.363	\N
1ef84eac-7c7e-40d4-957b-871c981fd465	a63311d5-7c4b-4884-b18a-970bfc0a68a1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.365	\N
9af93c3f-a3c7-4b63-9743-96a52c108cc2	a4ea9a4a-90df-4463-a26b-1f7c48cc825b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.368	\N
13b38183-0eeb-4ebc-bc2e-a7831e9889d4	81e9d5e5-18d4-4dec-929b-2f72a624cbdb	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.37	\N
1388913c-7788-489b-ba6d-05c1d2496d56	a68dbc5b-5b16-4917-8a83-a41853d9c974	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.372	\N
bbfcf368-9b9e-45f5-9ca1-adbd1730f7bf	3207f447-acf2-4560-ad39-a16307b9425b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.374	\N
6ebd7f99-9180-44d2-815d-bb3566034952	9db1a60c-f880-4aee-8094-23c07fad54c9	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.377	\N
500df598-2d5f-4e17-8133-18f2a4c80821	ad91f3d2-9dbd-47c5-bc46-a13fd64f53b4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.379	\N
d48b7a05-3c5a-4000-9948-4286f3cfeb0b	eede2f70-d8e6-4150-ab32-7c1c59e9414f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.381	\N
3ac01414-8d62-45b2-a1d8-8e8526b3a500	30c2bb31-d2e0-44c2-b6ec-2c4fb2358d54	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.384	\N
c0150894-93dd-4269-99d4-6c6fac55d98b	b6db9d09-9504-4757-a17d-ff24fe8e0ab8	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.386	\N
96a7ada1-48e0-4908-a644-8d81073549da	0f9b0c03-eecb-48f5-a153-bc1b69ecf1f0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.388	\N
a97391fa-4b37-41c9-a279-743462bc204c	32404bef-efc1-4d9e-bef9-4f22755799cc	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.391	\N
384b0124-feb4-4c87-94ae-3468ff459223	246ebc53-e204-457f-a859-a5e3ef8fdae6	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.393	\N
8adfb6a4-c058-43b0-87c5-7cc90a33cf18	56240cf4-8cd8-4661-b1f9-596ee34798a8	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.395	\N
927acf1b-68a3-4035-9c7b-4f2231651e8b	7dd4c782-f2c6-459f-ad98-6159a25abffd	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.397	\N
b4a8ceeb-f1c4-41a4-a5bd-cf58cea1b0e7	74fec172-1513-492c-8753-5bfd87f2fa20	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.399	\N
3a1f7db6-02f5-4fb2-b64a-6a513b597b32	8ebd8aba-574c-41a0-b78c-008d196c786a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.402	\N
ba96180d-a0bf-4a93-8491-97d3eb52631e	85438666-6e81-40ba-87b2-6165625eb912	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.404	\N
a1c9ca8a-f391-4c2d-80d9-3ed98f04ae0b	6ce97652-bb38-4bad-9f8a-1c0e8f63bcb3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.406	\N
527a8196-accc-43c6-a4c3-f26b54f81db0	7cf4a8c5-afec-499c-8876-b7abb79a78f6	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.409	\N
e4adfb77-5f09-4881-b2fd-09dea8fac653	0fc7c41b-cab0-497c-b0bc-4d6cdfb1c44f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.411	\N
ca2137f1-ab8d-4d14-a58f-406258358997	26a384c8-bb9b-4173-9b21-9b9c73e7e1ef	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.414	\N
90a00d0b-804e-4732-ac32-8bca8c2f390d	e5407367-ca08-41b0-91fe-563b93c331f1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.416	\N
88c7ac13-b40f-4529-8936-4f5ca9ec26c1	c954b0b5-3c26-45cd-8c80-b60b99c18d34	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.419	\N
bb16829f-c8ce-4407-985b-962dbf85cdae	79b756fa-2194-4862-be0c-97b613f829d5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.421	\N
07b16c37-861f-409a-9e24-20be7768f21c	9b9d92e8-adbb-40f7-94e3-f7b87ccac46c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.423	\N
8099b69b-19d9-4f80-b0fb-7e5124a97e6a	88903209-d4c0-4efa-b595-f532c08a93a5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.426	\N
e2af0e8f-48f2-4851-be0c-636a6979b4a0	02ba08c3-96e2-4c9d-badf-6d436f0b8467	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.428	\N
1271d66e-267a-4b8b-81ff-e70da1df01dd	5255ee11-4404-401f-bad6-2431fa81d689	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.43	\N
f9af6c4c-4e11-418e-81e0-d48ae429f049	bc5e5229-6a30-46a0-b4bd-765b8b8a9c98	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.433	\N
045cc139-ec9c-4a64-9523-9890b58bf1c5	43cc3ba2-35d1-4228-9f89-bb23302ca2ad	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.436	\N
752cc3be-6625-442f-b3ba-affa9738ae3e	3621910e-e51e-4cf4-8064-c57304700bb6	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.439	\N
ad7357dc-9be2-4a4e-8a0b-954c3e092d88	0244d5a0-4d34-4faa-8b6c-f739ec3d42b2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.442	\N
823a2831-f660-4abf-81c8-87bdfa4cac9c	3cc96655-7d8e-4753-9b01-3ef8ea58b3d8	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.444	\N
8e5a5e05-a37c-4c04-9bd0-41b8179a697f	7e3e77b5-648b-4ac2-8467-3e37687b90a2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.446	\N
1f9e3851-86e2-405f-8c67-d9a029f705c5	9312382f-aa13-4bca-a20e-ad467fe985e7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.448	\N
d08fbbd1-dd12-4945-aea6-01e40ba347c7	1581a350-37e9-48dc-bf6b-df0084998bf8	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.451	\N
5b7d0d7d-409e-4086-9ce6-1c8abdffcd9e	7a3b4254-b4fc-4a26-be1d-ddce86470bba	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.453	\N
fe33a72b-95ca-4b29-bf78-fdb48597cb57	8ed3017e-c064-406b-b069-88ef53add20d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.455	\N
502b27b5-c022-406b-a2a5-9f20ab619101	22fe6103-c959-4f94-ada8-a87a5b843d53	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.457	\N
7861cbfb-efa7-40f3-ade7-56919f58a76d	57c6fa6c-c2e4-4f76-bc7d-5780ee9a4fbc	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.459	\N
fd684407-1842-4c00-b69a-d002ffdda1bb	6c3a043d-a39c-4c9c-a122-4458dfe0cbc3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.462	\N
53722e45-e0d5-4ec4-98e1-f1b3d8a490bd	64a40340-9bdf-4002-bc04-563ffc046f86	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.464	\N
0efdde45-17d4-44c1-bff2-a4ea0605b042	3224a6bc-a958-4da7-89b7-8bd232950eac	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.466	\N
d5d6cea9-8322-464a-b54f-237ff6e6290c	a27ab6a7-c0e9-4822-902e-921b76adf3a5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.468	\N
7ddfb62e-cadc-4c95-8033-94452cebca1b	01ef60cc-c471-439e-861a-089688ac5368	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.47	\N
4192b9d9-dc3e-4074-97b4-85c9a1277a16	7de23b2f-9c3e-4243-b80a-eadcf9ae2609	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.472	\N
d0b324c0-560b-473c-a0cc-4571021fe3a9	ccca1f87-4e67-4293-8553-516b29f9c1ab	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.474	\N
a97a3f89-92a8-49a0-b0f6-14105ab84a72	9944a2c9-5857-40d2-95f5-07450d403790	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.477	\N
ab397a87-1cc5-465c-a4c3-89222cccf634	f489db27-fd37-4ba5-a5a0-ea915be96fec	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.479	\N
8e3ae70e-f5eb-4994-8799-4faea24970ea	d1b4deb4-74de-4da4-bbe5-894877c2c0f1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.481	\N
5df41560-d6a8-4922-bdee-593f7cb788ec	3dfd55fe-0e0b-4cde-a93a-e1042a4c4590	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.483	\N
223fe709-c8c7-45dc-810a-1321539451eb	0568fe17-4058-43b9-8943-6c18fc7eb9a9	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.485	\N
13f48b66-6b2d-42df-a8ae-80f085d0d6f1	a7b2dab2-11ce-416b-b896-7d9b243dba7f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.488	\N
77f68325-1808-40dc-aac6-f0d4f58a618d	5420cb5c-1294-40fe-83a2-9aecda374c9f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.49	\N
909667b6-8253-4d00-8884-5e977483c560	21355c55-ea6e-4174-be65-a41063776799	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.492	\N
e5b2e412-15c4-4623-bfd8-d69bf914b0b9	cc0f2060-fa38-4536-8b85-7cfafbbdef3f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.495	\N
994c22c3-5ed9-4ca9-b06a-fa082ca10ad4	bb2ab4e2-3efe-4de3-9778-c1a360183e00	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.497	\N
28e8cc9a-5fea-491b-a036-fed8aaa72a3b	0d9b5568-ff58-42f2-81ce-fdc8f412af7f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.499	\N
67c27e4a-3776-43fd-94dc-91f6f87d8de0	0772df4f-0858-4493-97ed-d59bf5571f18	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.502	\N
a4757330-eb9b-4f9d-890b-b9efd9d7c1fd	225ac957-20c2-4359-9fdf-f17e49af261f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.504	\N
39f28daf-0955-4b29-a522-dc19e51bf70c	616672ad-d0b7-42f6-a2e7-c9af73092b25	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.506	\N
9a170bf9-39c1-457e-8f35-4dfae892b79c	2c812f11-5158-4241-b2fd-60bb99a173a2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.508	\N
d9246d6a-23e1-4700-bbab-be5b9dce406b	1d9d521e-f188-4b68-a949-ae84e029faea	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.511	\N
b0d78b10-9dee-4d9b-b64f-8208a75c869b	45d28f23-eadb-4917-81fa-504f0b78cb2e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.513	\N
aca1fa6a-9b49-4062-86bc-2cbcdcd4837b	ffc613d4-dd4e-41bd-b6c1-14bed8f20b12	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.515	\N
c4093db0-cc0d-4d05-8039-1fb700d074ce	a48acafd-8beb-467f-b47b-15ef1d950b2f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.518	\N
2f0aceac-9804-4246-bff9-bd3c9409d168	d1649b4d-a870-489c-843d-dfc217e8c6d1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.52	\N
ade4cbb1-a2cf-4237-b5e9-da0f09db86f4	e4e0e577-96b1-4a3c-bcb1-a1d7e3c86ee1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.522	\N
b0c53c0b-2b9e-4efc-a639-491cb5ef3cad	a7e58f15-40cc-49c2-adf1-d267bee5f2a6	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.524	\N
58abaee7-708f-4bda-916f-083e2a002d02	e3414ee8-5111-4ba0-8e47-5a60c1119fa0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.527	\N
3ad91c97-4968-4d62-ad23-b8d2e2d85e62	6e18f1c5-b847-4387-a443-511e16b73f8f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.529	\N
3df9c00a-5809-4905-9e4f-d21d67d0a87e	cad44a8f-f493-4aaa-81f8-8598ac00bc87	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.531	\N
5ddee22c-dd9c-4b3e-bfe7-d17e2a2e6788	b190dc99-d825-4dfc-a73c-52b798a3b05e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.533	\N
3cebf0a0-7b4b-4b42-b393-40543ca4e9b2	64d121e1-23e9-433e-81d1-701836f3c0a2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.536	\N
0676ece4-2131-4e7f-a666-281a8708cd92	5968ae5e-0156-48f1-a409-c8967730956f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.538	\N
74261254-fb4f-47f9-8172-2842ff599861	77ad4eb7-2070-4b42-bade-81d4f8af6b46	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.54	\N
ed510919-e86e-40d2-ac56-5ea3d9902c61	9c1b4027-8444-41fb-a62a-c67eb1d42362	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.542	\N
880f9024-a4fa-4942-84de-292bbe42de76	edff3144-b6e7-48e1-922e-61364fa177b6	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.545	\N
736b34db-60af-45fa-8f39-c6aa4480ca8d	3e3bc515-2aa7-4c41-8422-5a6bbe9e93bf	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.547	\N
b46744b4-4f6e-49ba-b040-c5cf13a3087e	582b0b79-3b4b-4120-baf2-60d88ad6667e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.549	\N
1c02ff26-a5ad-4152-8ea6-77d82b890979	f2a326b5-ebb0-49c2-9840-9743376a7052	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.552	\N
0a8775a1-95b1-409d-9017-35241268c2a3	e1be1bc1-c1dd-4327-9a23-42cbdf96b365	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.554	\N
297bc51a-23fd-4230-9c27-1794d8245f7f	1544383f-4145-4546-8c90-0846e4e7f5c9	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.557	\N
dc6c1880-f646-43c9-9b05-9e792a095413	b4e5bb81-b25a-465a-9f0b-5087369f96cd	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.559	\N
474a0c58-9f89-4f58-949d-8358b632c811	8735ebc8-c1ff-4243-b7df-c5467a0ebb21	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.561	\N
aaa85f41-5416-471e-9781-ff6cde6e6a3a	cb3afe32-266d-4f08-95b5-8d8b25bf8c0a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.563	\N
c29456c1-f294-49c7-91d7-78122e8b683a	9f3a7699-5ac8-4afc-b228-49718961faa2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.566	\N
1bf6dbed-dfd2-402d-8106-59b0dc3570a9	03ab8441-64ea-49b1-94d0-6a9f1f85fbf9	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.568	\N
847e411e-8974-474f-aa97-61762e7f3a19	c1779d7b-1a04-4a5a-b0b6-54a96152aead	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.57	\N
49f1a993-62e9-4954-8c4f-0dc677062c5b	7636b779-7f83-4df2-b077-04b8ab277dba	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.572	\N
dff88910-ec2c-4bb0-8332-661cc472fd20	50eeb6fb-7d7c-4422-9f64-9948bebe2ba8	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.575	\N
ee7285cf-eee0-48bb-8165-1f93809938d6	80526d42-980d-4f3d-95b1-44d9d214bdd8	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.577	\N
333deac5-bc59-48fd-b359-eee5b4173e55	fd7cad21-603c-46a6-ad6b-9a4fc5fc0ca3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.579	\N
feebba1b-bf3c-4504-9824-4c83c2ff66a3	4c200daa-7b0c-41c6-ab57-752b3c05540d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.581	\N
c7b2d774-613b-4dce-ad21-1b59d548213e	6d5bed16-b26c-458b-af3b-bac3be216bcf	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.583	\N
a03f2ce2-12eb-432e-910b-165037009c9d	64a68263-33eb-4752-bb95-b4b1a10518bc	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.586	\N
8d5546f0-5724-4361-b9de-f493e7b8da39	6a2d107c-ce72-4a21-a905-d54172f879f0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.588	\N
da916af8-e3d2-44cd-a078-6b06b8e9ff31	be674c80-27d1-432d-8f2f-bfe19310219b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.59	\N
ff1370eb-474e-4019-8aa2-435bd586c26c	c21b678e-01a1-43c8-9b4e-7f40df238af4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.592	\N
4239ef1c-dd02-48c9-9755-88507697e75c	d23fd298-fe7d-4248-81ca-4c0ecba2bc80	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.595	\N
f6004836-67ac-4dde-b630-15516e6639b3	1d18c337-60a3-49fd-badc-6de8db70f791	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.597	\N
6a8cc62d-8331-40d6-b33f-7d17dbb4543b	ad3e4689-7605-4043-aa8d-442ec0d458ae	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.6	\N
93d9944d-0ac1-4591-a4b1-f9c7b6bda3c5	a06f0754-ed5e-4a45-89a7-570e52903c00	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.602	\N
f21edd20-20c7-4890-aac7-4092f28f8446	738b2836-73bb-409c-b45b-ffd3583f658a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.605	\N
1bd404db-0269-4156-a980-edde15db3880	27881649-7f29-4ac9-b409-4751eecbdd18	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.607	\N
c23f7518-1aa1-497a-b0bd-867b8933fbbc	35a57c3e-9821-4dde-ac22-9f7627df9fdd	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.61	\N
68c6bfb4-5318-43ac-bc9c-f640be88993f	fc182a83-1282-4b71-890c-e66cd7c68e75	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.612	\N
93c8b78b-abf9-41bb-8cf8-5d962d725dcc	22193288-c4da-495b-84c2-ff7ef1aec752	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.615	\N
1cc237c1-37c7-445a-8094-37c65292127f	aa20b357-6d5e-4895-b38c-b438d6f341cc	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.617	\N
34581067-7431-4e36-b172-46139308b92b	385a5dd0-d397-4f99-b5b0-4946b88fb4bf	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.619	\N
77ccab15-bc59-40d3-af01-da93eacb288a	7a2ea577-d11c-4f63-b55d-ccb079bed19e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.622	\N
9a1a9030-df4c-4e10-9e85-e25c20ada507	b9ae039c-a3fa-46c3-b269-53480a50fd7f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.624	\N
cf60bc92-d8a8-4a5b-b943-04be1032a9a9	9b74069d-1ce7-4829-a2e5-fe5cc2f9e135	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.626	\N
8a62c16d-ca75-4cc2-b808-9419d05d205b	92a19eb4-97dc-476a-b101-75841d096cee	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.629	\N
f26a0e83-94e0-4be4-b141-bf490b20617c	29d78883-37f2-4e6d-b008-fbc289b09a0c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.631	\N
c5b7dc2c-7f87-4ed5-9893-ec9a4c586fab	fba26079-4dfb-4c17-b8c2-1be8b4b5bdf0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.634	\N
6e50c53c-8a1c-45a0-aa21-932bbf3264c4	bef30ee9-e2ba-4048-917e-f75444cdf009	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.636	\N
8ccf2b6d-29a7-471c-879a-9be237d53049	3d5367d2-12bd-4340-b771-29a97981e5c1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.638	\N
de36ec89-6682-41f0-a6aa-0e4e9ebfd9ac	9e2f8ce6-4973-40a7-a3a7-d5c6d0f649ca	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.64	\N
7429e68c-f4f5-4c4b-887d-39ec5da7ac10	69f0eeba-8d74-454e-9e41-e778c92aec36	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.642	\N
069244a1-5f2d-40eb-831d-458dd4812413	19268599-d3af-4f6e-b3bc-c27e9f01a6c5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.645	\N
7a0073e2-0a82-4fd2-bf71-3e0e4207bdfb	7b649b07-e233-4af4-bbef-6f2e820272ff	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.648	\N
e85710d2-688c-46f0-8178-5b77d25e11f5	702e93d0-5d4d-4b5f-b06e-4cf0400b5350	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.65	\N
565c2050-8323-48a3-a837-041b3613c194	12a8edc0-da46-4a56-b8f2-a7bb68ec21f3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.653	\N
07d81a62-1035-4b31-a58d-734b73ad523a	5e93c83a-aefa-45e3-8b46-9a6467c749ee	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.655	\N
82d2c862-b8e3-4f6f-9a62-d7ea8901adec	609f7994-be3a-404e-bb68-2adb3adc1531	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.657	\N
ee0ca0bb-2727-4f96-ae91-e75afe1b66e1	5cbcd3a3-9f49-415b-a0ad-7c309aef75d0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.659	\N
ca7e76d2-11e4-4778-af6e-95874c9a860e	9ed92a83-eb38-41b8-8970-f60601463cbc	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.662	\N
6e1a5a0a-7c38-4245-a5fd-03234b8a494b	a733d6fb-d9c1-48d4-83e2-1e7c8f2c906d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.664	\N
40fdbaf2-9e40-41df-b1e1-28fde419c976	d9530e04-be75-4bad-9db9-a5d1cd08deac	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.666	\N
c1e66116-bb4e-4827-8857-2d1844efadeb	ef9bb5ac-b7cc-42d8-9750-972ad2cfe5b5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.668	\N
475b4406-9e0c-49e1-8b7a-9609834ffd60	d211f2c9-fe2b-4efc-b72a-8ea0dbdec767	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.669	\N
aa52af10-4975-4519-a9e8-9e19aab1acc8	e17db423-7456-4dfe-a19e-86dc00d00e97	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.671	\N
e8f4ad79-e17d-4200-93ef-9e37182e8a2a	f27e6eac-9d28-46f9-9e68-ee13507b800d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.674	\N
ed58bff7-c91c-4b6f-9e95-cc181352bd3c	a599cb2f-c8ab-42f5-b53c-b7540065f66d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.676	\N
96648d67-432d-44e9-8c35-99ce8b8fa2ed	8d5023c8-6586-4c46-a64e-82d6c5a446fe	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.678	\N
fe4bbf0d-5dd0-4044-b1dc-2b0aede90c34	70cadb50-7cf8-4ef2-819d-dfa0053e1b07	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.68	\N
7a42730b-5ee9-4bec-a7f7-79c675c2f12b	29c0a76a-3194-4e66-a299-89d9d0aa29c3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.683	\N
401755bd-b365-4586-9862-6ebcba14291c	92585fcb-cc4b-49a1-b36b-a4e5e5c0ef4b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.685	\N
caa34e93-9cbd-4312-be0c-44e78e17079f	3a77ca5d-e01f-481e-a2d1-1efcbe5c54fd	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.687	\N
6d98cebb-b325-4d61-a486-06a75f05bf59	5d653797-22fc-4a74-b3c0-50c8d6c435db	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.69	\N
4d806f0b-a68b-4599-8e33-b7ef8c710364	11ec5010-71bf-4196-8820-9df849b2bd20	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.693	\N
fd931764-698c-4782-b086-bc9e3ad98a7d	bdf789a7-dc1d-4d63-a448-f7057751caec	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.695	\N
8d3fe600-4868-4133-bfe1-1c6de64123a3	70c30b38-2e4f-41c9-9019-de43c8232951	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.697	\N
30a0d891-da98-4081-9860-e37ab02852f3	13802aae-cf49-49ff-b5a1-075ce75393fc	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.7	\N
d13cfcb1-b57a-45fd-9da2-a2faf0b51307	18e66ebb-19fe-4816-bc08-d20368e9fba9	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.702	\N
f0436d4b-76a5-4263-9c5b-a6151940ec04	1f214e43-c12f-4cf9-ae52-79d54af73ad7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.704	\N
00047908-2e81-41ba-b856-220c6db43fdc	b1ef9765-5742-4cd8-a93b-3fc18a577ea1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.707	\N
c28130ae-8793-4f90-8689-492c0d308987	f3862ce6-9203-402c-9d92-697d43e17dca	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.709	\N
eec3abaf-981b-4be5-ab20-5d9d214ef5f1	54d067b6-8a78-41cb-be97-c41d82ab9ead	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.711	\N
06f8d5e3-deb8-40ac-8040-23f2c334f253	4158d4d2-06d7-4eb5-8bb6-07a7e2b24114	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.714	\N
384e733b-614e-49e2-9c63-5ed1834b0a93	a35426dc-a452-4461-a777-5b9a0f8dfcb4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.716	\N
7777d2b4-be9e-45c3-b849-0deb4b674988	23b598e0-6832-423e-9387-c7e7be2ca238	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.718	\N
c14ff09e-f2ea-423a-979b-f6cd9d7048c0	0fa4e2cb-461d-49f2-8f5a-608dbbd555ff	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.72	\N
462236b3-7d01-498f-9711-911e834558bf	62e2f957-3d64-4ab4-aeb8-20e82bb1d19d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.722	\N
05d7da97-c2d8-426c-b5d3-49e2b93fff8f	4b5ded58-e23f-48a7-a116-e11041a1470a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.725	\N
b0446006-381f-4d61-babd-b0ecb1a96470	50702b82-c5cb-4bfa-a3b7-bd6d33c79ff3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.727	\N
6874b202-c4df-4322-874c-58654cbc9f7d	b1a99c42-c75d-4313-a020-afa2fe20e05d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.729	\N
e82c49da-01ac-4c83-b5a6-ec414ecdf80a	f5ede221-5295-43a1-9ded-208895006160	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.732	\N
6b6feebe-9254-4328-8b39-8103ff92c070	d8b7cb23-7a13-4a34-8abe-6c049ef7bdab	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.734	\N
5f80d95a-cfdd-47be-8aac-b071e935f76a	05e78ee7-91e8-465f-8e54-9739737cd939	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.736	\N
79b920fd-7576-4425-93fe-703c290d47ae	48def7e8-fd1c-40a3-ac63-211ff42e6717	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.738	\N
cdf7e3d0-c9ff-4966-8c55-8d16f22104a9	82065f91-419f-4100-842b-3fa95d2ea3bf	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.74	\N
1cd73f0b-d268-403d-bd4e-6e2efa9822ea	b931ee16-ff03-4628-ab86-cbd4950a2b6a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.742	\N
d106c621-ca9f-4bcd-9083-3ccdb5d0d3ba	36578b39-19a0-44da-bcd2-ab5839057cf8	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.744	\N
d0a99a55-35e3-48e7-8ec5-4a5c0335c3a2	fd99665b-b5f6-4ee5-95d4-b6bdf590bc8b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.747	\N
72da3780-ccb5-40fa-95b9-c4ded4c53959	2c60fb4e-3695-4c3a-b2bb-7acdc6c7e399	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.749	\N
16ef1d7c-4bd3-4bd5-89f0-67191920ec99	59c92a73-0287-4f25-a581-9fafe84d2380	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.751	\N
0c3af331-8c80-48d2-823e-9c66948dfbfb	9802ccfb-18ac-4d59-b553-2f999dd374bd	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.754	\N
8dbac572-e319-4774-8d60-e442763c9567	78e2dc7c-cadc-4e9c-a769-580af47e5ed2	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.756	\N
4cd0f1ec-998e-46e3-aa5c-621acc56afb5	9b68a925-0fde-429f-b992-033f54b48c3e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.758	\N
267343c1-151f-4161-8573-339db8404df6	98b2f9d3-2353-4c49-b5c7-1f2b62b172d1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.76	\N
4a7a3d43-e551-4be9-bc01-1e11eccf8c26	15228291-3bb3-4ebb-9be4-125ac47e37a0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.763	\N
066a7dbc-72ef-46e4-be0a-b34f72e601d4	0849cdff-7e3b-4a52-b759-4729e5d5484d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.765	\N
4bc7e4b6-9da4-4268-8da3-7ecb6b4cf086	e0f7ef74-0cbe-401f-b7c8-a2bd0932b8c4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.767	\N
576ed773-b4ab-4d7f-9cd7-a7703e3dc689	8802858d-6755-4b96-8214-c86e61cbc3e1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.769	\N
1a7f86ff-c33f-49ac-9eb8-180c6bf4fd68	12152fe4-f459-4c7f-b1d1-0f2e66ca3783	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.772	\N
497f0f55-2b83-4910-b2b9-79994ed639e3	b9707abc-c2f1-4c20-94a6-f8852191cfb4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.775	\N
4f4c161a-6648-47d5-93ed-5943d2ff0ecb	5f8b9403-2e09-4edf-a1a1-9f584dd071e8	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.778	\N
ec1549fe-75fe-43e0-abf2-969f60b00764	8fedd938-2b90-4d04-a3d0-e9f2a3378a45	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.78	\N
96b5de2b-4c6d-41c7-b90c-bbaea31de9a8	98fae3dd-3f55-45f5-b601-061914f6b9d3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.782	\N
57966ef6-26de-4cf5-a093-7ab8d4dd26e7	251aa085-25ad-4c2b-b141-70f9703c97b5	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.785	\N
a361226d-2d77-49e3-81c7-da15ea49a263	ff5dd0b1-8284-45c6-a925-e78ac82552b6	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.787	\N
ee9834f0-60b7-45df-83c4-0617a952c716	00aad063-b2f4-49bb-a97b-6d2baa97fa56	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.789	\N
964a0ef9-7d74-45d9-a3f7-f2febba0ab80	5e4903a6-4192-40df-a1ec-1ac9a0a90d31	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.792	\N
1075ec2c-d631-44ac-a621-8a46f505cede	037c53f7-879b-40fa-b850-a70310ae89b3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.795	\N
14ef4ea6-175e-4686-86b0-74bcf84565aa	0f0b2bc6-f452-454f-8b31-4ef5054f4fa7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.797	\N
fcb591c8-dad2-4cd9-85c7-ab706002f63d	cdb57272-3f21-45c4-8845-42a44acae683	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.8	\N
29dfd8bc-0478-48b5-a402-9d10b73fc76c	5a4e6092-e919-4a08-9099-e2e91b1b153d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.802	\N
66ea9e73-41c3-4a53-9722-eaaa7aad43c9	b80543a9-7905-4088-b42e-07eca875e3b8	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.805	\N
6e7b0bd4-47c3-4453-b827-d93f9ab950b2	028fab4a-7581-4067-a098-43db83d601be	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.807	\N
21002c44-b2bd-4720-8809-986d9a126b3d	37d134c0-e050-4a5b-a960-96bad2593847	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.809	\N
825adbaf-60c6-4de6-95bb-02c155c2b0d2	b90744fc-741c-40f9-8b4a-c2ccd3cf42ad	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.812	\N
dae919d3-ef31-4629-9c06-d3e7d5009869	3f9d14e0-b096-4b8f-9e11-30d16afe9492	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.814	\N
29f7a46f-9a26-4b65-9daf-d828a3196988	f0b207e3-3902-4360-8705-2786d5ebefee	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.817	\N
addf5652-aea7-416e-8509-00d67ecc483f	93017226-10ad-4747-841b-ff840db42693	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.819	\N
2a683e25-3874-4bc0-9f2e-98dc219ac93c	118d9731-d00a-4d8a-a552-c27e1f8989ae	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.821	\N
1aff97fe-4d88-41d9-9e56-0c2544a37f6e	82a80882-6e45-4d82-8aaf-54754f4b37ad	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.824	\N
cbac8de1-8b3b-4a52-8f97-f237e47eba56	b4cbb62a-d228-444e-bb4c-cf54a4aa2a67	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.826	\N
0399ec17-bff2-4237-9360-74b0ccdb83c4	ed14ef2a-d14f-41a5-bc1c-0b185abf5a7a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.828	\N
2bd045d1-6b14-4797-be48-8fa1f4c177d1	27f3b190-cb53-4410-badf-40e3759cf6fe	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.831	\N
c0d3462d-55c2-4b3a-834b-8b45e48940a8	ce349ed8-9372-4e8a-a7f5-81f501422d10	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.834	\N
3fc90b8c-32b7-4c5d-a74d-e80061e83318	36fa7bcc-1218-451f-afe6-b2eb5e8cb82b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.836	\N
6185e979-c0cc-4421-a0eb-048f43cceecb	bff18c0a-703a-4436-a61d-7961f2c5bb98	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.838	\N
8db8ec66-15e8-4fe6-9223-8d5886addeec	775c87a6-e14d-431a-8b63-af3f9f65dbac	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.841	\N
1a84a245-d6f4-40c5-a5c1-99f7f3966640	13eb09f7-3353-49c7-9800-04151bc16f93	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.844	\N
dbd8a8ea-860b-43f0-9357-01bc19c30bf8	4491dbfa-b6aa-4224-a6b0-49cace02566c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.847	\N
ef7d0c42-4946-493b-be68-b5786b4eff62	8ac2a6b5-b496-4afd-a286-c51eb6305f94	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.849	\N
fe2bd8c2-3007-4e65-9a6a-5b7bdeac802b	9ab11b9e-af1f-4db8-9d87-3d968de67bb4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.851	\N
fe88fa32-ebcc-4742-9635-bf3c28e32f0b	1bf829cb-b869-4a6d-b954-94fb4db55d1f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.853	\N
09c376a4-4581-46a4-9ddf-ee4e0056c7ae	41083462-ce8b-44ca-a79e-4aae886c9408	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.856	\N
6891a679-7dd5-46a6-8756-2e0ef2f2d5f0	0f1f51a4-06c0-4836-a778-03161868e623	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.858	\N
381173f7-43aa-4884-9e17-afb6130209f1	56837d55-7964-47db-a513-9223b35b192d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.861	\N
97190d96-5c73-4a61-8362-7091efd164ad	823318a3-5ba8-4209-99a6-7399a3289ef1	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.863	\N
1a32b6d2-062a-41a2-8f05-5eb17f300f2b	7a2353da-c333-422f-aae7-b0d68858767a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.865	\N
d9914b52-7b1d-42a6-93aa-f59b47efe65b	b2ca7450-a672-421c-9c7b-e3cfaa77e115	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.868	\N
15fa8b37-a3e1-429e-9906-932272453112	0df82467-41f3-48a8-a9c5-476b5e1268bf	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.87	\N
457790c6-9be3-4bf7-aa5a-cb7c3bf7f6b6	368e2fed-fdd8-43d3-a7c6-d93d083e5d73	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.874	\N
543a1cf7-e667-44c4-87df-2f00d921792b	4d3eec7a-bfab-496b-98bd-c58c89a891d4	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.877	\N
5b13210c-ec65-43e1-adcb-16b3c5f2cfa5	bc229e3b-0cb4-417a-bf31-b06dd998867f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.879	\N
018cadc9-f59d-4906-8fa1-edb98774457d	ed0dd3bb-6495-41e8-a055-414962138394	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.882	\N
15c3a50b-ce4a-4216-97ff-21af08d48a87	2f7f5fae-1e0b-4168-83c4-598bd1a58527	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.885	\N
a0d91553-0e28-4898-9264-40ea3c12ea99	b3fbe546-d9ac-4316-93b7-2730265c1826	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.887	\N
206f790f-5482-4334-8c9f-04a6fa8ac535	f83826ac-8db3-4f0d-a9d8-0994ddade951	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.889	\N
e96babe5-a8aa-4ed5-88b5-7846120ae5db	676a2b4a-fe30-414f-8149-f9f47fa452bc	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.892	\N
c5b459f8-300b-483a-9999-75a2aa359580	c3fbc949-f622-4f4f-b669-06c465d8c1a7	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.894	\N
1a455368-9595-45b0-882f-cd7f37c6e764	3b37a3f4-c108-4317-b761-d83e4ae1737d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.897	\N
9a24fe15-1513-488f-8f1e-28b74f8814e1	8051fcac-2dea-4c82-94a0-bbd2d989da9b	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.899	\N
2d7b0cf8-1e8c-4d1b-9873-5c8ac95ab994	ee0c1b49-bfc8-4954-bfae-0fc589cd547c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.901	\N
8767e568-35b9-42ba-a098-2c6b6dbb1616	8c5d26b6-6599-4269-902d-3dac37c28761	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.903	\N
61576864-92ed-4d9d-a01d-ab8a42253d47	ae494727-767f-4046-8c6e-45c8a0acfc1d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.908	\N
c1bce1aa-294e-4f0d-926f-1cff0ee17639	f2c39a56-ec71-43dc-855c-3995a888cefc	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.911	\N
8aafcb2d-0e07-470e-bbda-3bb7165078f0	010d941a-a1db-41df-862f-070e59282487	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.913	\N
1bee6ede-0ba4-4ce3-9f5b-6453caba693d	a2d0928b-c0f2-4984-8649-c01048dd287a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.915	\N
3a480edd-33d7-4b49-978a-c0beb688bd6a	c068fc6c-2700-49ce-9ea4-e0a299743d66	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.917	\N
62da6e6c-9cb1-40ee-8060-1ef5414063e9	ab93b901-0200-49cd-8e03-fac7772cee81	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.92	\N
d1ed5e98-5913-4ba4-96b9-9a5aeff4dc74	2c6ff301-fd4d-487f-868b-d642be535263	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.922	\N
56cf7118-3c28-4ab9-b7af-9dfd13e2832b	6bba6a83-1858-4282-8324-8e2f56252031	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.924	\N
cd42c885-d5b4-4221-b563-563645fa592a	37a7c385-4aa0-447f-8152-018fc6a1eb97	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.926	\N
34bc0a1f-e39a-4abc-953a-965f48f4d9d1	10c6e572-4b79-4160-ad7e-7b150014d932	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.928	\N
4b762596-9e9d-4342-99cf-dd895289eaa2	f1849675-f88c-4e3f-8d03-85a50b8e0ca0	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.931	\N
a3c653f7-1e47-4465-a6c8-e2605e297a26	4880e230-f9ff-4a21-9cf1-472fa723f1a3	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.933	\N
66620f96-f799-4daf-adc5-da9c0ea26300	82f0b949-22b8-4afd-8848-29c39e526b7d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.936	\N
e45fed15-79c9-4855-ae41-ac9e1413f00b	379469b9-55a8-4ee6-8d9d-75b5bfc7b6f9	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.938	\N
5468a08b-09fa-4db1-8ec0-9312b9661fc1	c273929b-a6f2-40ca-b08f-0cc6a3bd946e	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.941	\N
c24d9f47-7871-4f9a-8217-b7845f2385cf	a8f1bd98-e709-4b00-9b9f-fa9f906bc3ae	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.943	\N
1260c76c-39e7-4b2b-8519-bb9dc1f3afa6	ebc69c91-4a43-449a-8e3f-29703884551f	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.946	\N
acd09e38-0327-444a-9cdb-f6c8eadad6e2	8bb90504-7e21-4e33-885b-7e56f3ae694d	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.948	\N
0ef7a8f5-a735-4623-8128-f45f9520dbe9	fcfd6269-4679-402b-bdae-535bdb1636e9	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.951	\N
03430572-7a83-4210-9226-da2fc01b0d50	09d53288-1cc9-42e4-ac0c-9d6849ac38dc	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.953	\N
0b166266-0d7e-4a3c-a801-b6b105ffb10a	1bf57d58-a8fe-4c76-afb4-f46f489fbb54	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.955	\N
beb96e50-1f0c-494e-b03f-6c5cfa750fe1	f4c535e1-dd3c-45cf-a343-381bbbf4aa4c	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.957	\N
7e9575e0-88cf-44df-aea5-af5d324a6d7d	1f85d618-f3ae-4226-9f38-5e7e34e3d275	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.96	\N
b354067c-5f09-42c1-8357-00f4a1a40cfd	2c68545b-b228-470b-ae00-2d6b17c4682a	cmj0bs16u00001atx0vzfjs5n	0	2025-12-11 14:40:36.962	\N
65775235-5f21-41d0-b029-efd30747c613	ded2fec9-1b9f-43a1-9717-19d6fb6c2692	cmj0bs16u00001atx0vzfjs5n	10	2025-12-12 02:58:39.697	\N
\.


--
-- Data for Name: ProfitCalculation; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."ProfitCalculation" (id, "periodStart", "periodEnd", "periodType", "branchId", "partnerId", "totalRevenue", "totalCOGS", "operatingExpenses", "grossProfit", "grossMargin", "operatingProfit", "operatingMargin", "netProfit", "netMargin", ebitda, "breakEvenPoint", "expenseBreakdown", "revenueBreakdown", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: QualityScore; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."QualityScore" (id, "bookingId", "serviceId", "staffId", "overallScore", "technicalScore", "consistencyScore", "timingScore", "productScore", evenness, tension, "productAmount", spacing, temperature, timing, "aiAnalysis", strengths, weaknesses, "capturedAt") FROM stdin;
\.


--
-- Data for Name: Reminder; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Reminder" (id, "customerId", type, "sendAt", sent, "sentAt", channel, message, metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: RestockRecommendation; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."RestockRecommendation" (id, "productId", "projectionId", "currentStock", "safetyStock", "daysUntilEmpty", "recommendedQty", "recommendedUnit", "estimatedCost", priority, reason, status, "approvedBy", "approvedAt", "orderedAt", "receivedAt", "budgetCategory", "canDefer", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: RestockTrigger; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."RestockTrigger" (id, "productId", "triggerType", severity, "currentStock", threshold, message, status, "acknowledgedAt", "resolvedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: Revenue; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Revenue" (id, date, amount, source, "paymentMethod", currency, "branchId", "partnerId", "customerId", "staffId", "serviceId", "invoiceId", "bookingId", "productId", description, notes, "receiptUrl", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: RewardCatalog; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."RewardCatalog" (id, "rewardName", "rewardType", "rewardValue", "pointsRequired", "eligibleTiers", description, "imageUrl", "maxRedemptions", "maxTotal", "currentRedemptions", "startDate", "endDate", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: RewardRedemption; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."RewardRedemption" (id, "customerId", "membershipId", "rewardId", "pointsUsed", status, "bookingId", "serviceId", "usedAt", "expiresAt", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: RoleplaySession; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."RoleplaySession" (id, "userId", role, scenario, persona, messages, score, assessment, feedback, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SOP; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."SOP" (id, step, title, detail, role, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SOPEnforcement; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."SOPEnforcement" (id, "partnerId", "branchId", "sopId", "sopVersion", "enforcementLevel", status, "effectiveDate", "expiryDate", monitored, "violationsCount", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SalaryPayout; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."SalaryPayout" (id, "staffId", "branchId", month, "totalSalary", breakdown, "generatedAt") FROM stdin;
\.


--
-- Data for Name: SalesFunnel; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."SalesFunnel" (id, "customerId", "funnelStage", "entryPoint", "currentService", "currentProduct", "stepsCompleted", "currentStep", "automationActive", "nextAction", "nextActionDate", "timeInFunnel", "conversionProbability", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ScalpConditionAnalysis; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."ScalpConditionAnalysis" (id, "customerId", "scalpType", dandruff, "dandruffType", "fungalInfection", inflammation, "rootStrength", "hairLoss", analysis, issues, recommendations, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Service; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Service" (id, name, code, category, description, "englishName", "englishDescription", price, duration, image, "isActive", "allowPriceOverride", "displayLocation", unit) FROM stdin;
df841cf7-d391-46ec-b331-c2a617cfb94d	ẨM THỰC	DV10614	Y DỊCH VỤ KHÁC	\N	\N	\N	0	30	\N	t	f	\N	\N
e3226b33-1c80-4d02-88f2-5442dd40c8a3	CẮT DA TAY /CHÂN	DV11715	NAIL	\N	\N	\N	100000	30	\N	t	f	\N	\N
00b43fb8-e80a-4d05-9374-dec6f9385fc9	Phi The Dich Vu	DV13236	Thẻ thành viên	\N	\N	\N	30000	30	\N	t	f	\N	\N
6e8a9efe-fe41-4c00-baf7-427e5f2f4224	PHỤ THU NGOÀI GIỜ	OVERTIME	PHÍ	\N	\N	\N	200000	30	\N	t	f	\N	\N
c37af8d1-86ef-4e49-bfde-5df7207463fe	RELAX FOOT 40P	F40	RELAX	\N	\N	\N	260000	30	\N	t	f	\N	\N
5a033209-a1ee-4775-ae4f-a8212fcfb554	RELAX FOOT 60P	F60	RELAX	\N	\N	\N	330000	30	\N	t	f	\N	\N
f8cb2bed-a96c-4d37-a089-ff3fd3408a89	RELAX TAY 20P	T20	RELAX	\N	\N	\N	100000	30	\N	t	f	\N	\N
5c231077-d918-4a85-ab8f-ff8f6c7aa46d	SƠN GEL TAY / CHÂN	DV73450	NAIL	\N	\N	\N	160000	30	\N	t	f	\N	\N
4d567eb8-277a-48c2-8b5f-d1c68e294df4	FILL GEL	DV73465	NAIL	\N	\N	\N	250000	30	\N	t	f	\N	\N
9f7b8ff5-406c-44af-ad07-5608b8966a6e	SƠN OMBRE	DV73468	NAIL	\N	\N	\N	230000	30	\N	t	f	\N	\N
3adc8778-532f-4a03-89d7-959ec5caae16	SƠN GEL MẮT MÈO	DV73470	NAIL	\N	\N	\N	230000	30	\N	t	f	\N	\N
8dc72a3a-f2e6-4781-88b4-353513eb6a60	SƠN GEL TRÁNG GƯƠNG	GƯƠNG	NAIL	\N	\N	\N	300000	30	\N	t	f	\N	\N
de53d910-9a45-4d70-bd62-db8bd7cffd7e	FILL ÚP MÓNG	DV73479	NAIL	\N	\N	\N	150000	30	\N	t	f	\N	\N
c09d8131-0fb2-4000-82cf-5e27a697b4a7	TRANG TRÍ	DV73480	NAIL	\N	\N	\N	0	30	\N	t	f	\N	\N
c4edf178-63d2-41d4-a6bb-04929ec0bd08	THÁO GEL	DV73485	NAIL	\N	\N	\N	100000	30	\N	t	f	\N	\N
5cb8a9df-21fb-413f-b5ea-ff206cfb0505	CHĂM SÓC CHÂN CHUYÊN SÂU CND	DV76940	RELAX	\N	\N	\N	320000	30	\N	t	f	\N	\N
01a47d52-7a69-4d91-80a8-7d8e4186e0af	RELAX  CỔ - VAI - GÁY 20P	V20	RELAX	\N	\N	\N	150000	30	\N	t	f	\N	\N
e4801e8f-16a6-4a14-a18f-0198cb44dfbc	RELAX  BODY 60P	B60	RELAX	\N	\N	\N	500000	30	\N	t	f	\N	\N
4f415fd0-03a2-41b2-ae1f-98f96de70ed1	RELAX  BODY 90P	B90	RELAX	\N	\N	\N	650000	30	\N	t	f	\N	\N
bce33814-074f-40ff-8e89-bcb1530bca08	BẢO HÀNH PHỦ MÀU	DV288395	KHÓA TÓC BẢO HÀNH	\N	\N	\N	0	30	\N	t	f	\N	\N
e4922098-f96d-48a4-818b-d2bfde90d078	ÚP MÓNG	DV349211	NAIL	\N	\N	\N	300000	30	\N	t	f	\N	\N
9238f02e-977d-44a5-a5cb-369c67a80e0b	SƠN FRENCH ĐẦU MÓNG	DV404270	NAIL	\N	\N	\N	300000	30	\N	t	f	\N	\N
2b6da529-e648-4552-8737-077e4ba6fbf9	PHÍ DỊCH VỤ GỘI	KHÁCH	PHÍ	\N	\N	\N	220000	30	\N	t	f	\N	\N
fe794142-de66-41b5-a17f-ad9609cd0f1a	ĐẮP MÓNG	DẮP MÓNG	NAIL	\N	\N	\N	400000	30	\N	t	f	\N	\N
6665f15c-025b-4eec-9d45-c2dd063fb26e	PHÍ TẨY TBC MẶT	DV509917	PHÍ	\N	\N	\N	20000	30	\N	t	f	\N	\N
d8b074ea-6eb3-4d7f-8fdd-1506e9faa122	PHỤ THU PHÒNG VIP	VIP	PHÍ	\N	\N	\N	400000	30	\N	t	f	\N	\N
0183c0e8-5e78-4f80-91d3-8d617be81198	TẨY TẾ BÀO CHẾT	tbcnail	NAIL	\N	\N	\N	120000	30	\N	t	f	\N	\N
3d68b31d-48ec-4503-be78-9702728daf5a	NGÂM CHÂN MUỐI HIMALAYA	DV622250	RELAX	\N	\N	\N	80000	30	\N	t	f	\N	\N
aab7d365-70f9-4160-93f1-4d8dbc1bbe02	NỐI TÓC NHUỘM MÀU LÔNG VŨ 50CM	50LVN	NỐI TÓC LÔNG VŨ	\N	\N	\N	55000	30	\N	t	f	\N	\N
c3d0800a-a205-48f8-8257-c7f164591d49	NỐI TÓC NHUỘM MÀU LÔNG VŨ 60CM	60LVN	NỐI TÓC LÔNG VŨ	\N	\N	\N	60000	30	\N	t	f	\N	\N
fd83ed7e-3bf6-42a9-bed9-bb627b71cc3b	NỐI TÓC NHUỘM MÀU  LÔNG VŨ  65CM	65LVN	NỐI TÓC LÔNG VŨ	\N	\N	\N	70000	30	\N	t	f	\N	\N
dc65274d-f3f1-474e-9988-9475a2fe9f5f	NỐI TÓC TẨY LÔNG VŨ 50CM	50LVT	NỐI TÓC LÔNG VŨ	\N	\N	\N	60000	30	\N	t	f	\N	\N
50488678-1fa7-4541-b38f-6e1183a937fa	NỐI TÓC TẨY LÔNG VŨ 60CM	60LVT	NỐI TÓC LÔNG VŨ	\N	\N	\N	70000	30	\N	t	f	\N	\N
37d64ea6-cd3d-4359-b8da-7b94aa027f3c	NỐI TÓC TẨY LÔNG VŨ 65CM	65LVT	NỐI TÓC LÔNG VŨ	\N	\N	\N	80000	30	\N	t	f	\N	\N
5440abe7-bb44-457c-99b4-ee0713eecb4e	NÂNG MỐI NỐI / CHÙM	NANGNOI	NỐI TÓC	\N	\N	\N	1000000	30	\N	t	f	\N	\N
bda7f53f-020f-48d7-b640-adb9af9d5e67	NỐI TÓC ĐEN  BẰNG CHUN 50CM	50CHUN	NỐI TÓC CHUN	\N	\N	\N	2000000	30	\N	t	f	\N	\N
52763881-db68-4406-a29d-1937dfae4603	NỐI TÓC ĐEN BẰNG CHUN 60CM	60CHUN	NỐI TÓC CHUN	\N	\N	\N	2300000	30	\N	t	f	\N	\N
ad046fe9-436a-44b0-a8cc-ba4726192d3f	NỐI TÓC ĐEN BẰNG CHUN 70CM	70CHUN	NỐI TÓC CHUN	\N	\N	\N	2800000	30	\N	t	f	\N	\N
0bf23631-f25d-4e79-a307-3c165d1938f1	NỐI TÓC NHUỘM MÀU  BẰNG CHUN 50CM	50CHUNN	NỐI TÓC CHUN ( TẨY+ MÀU )	\N	\N	\N	2300000	30	\N	t	f	\N	\N
2b36f3a5-c19b-4fb5-91ae-82638796a30d	NỐI TÓC NHUỘM MÀU  BẰNG CHUN 60CM	60CHUNN	NỐI TÓC CHUN ( TẨY+ MÀU )	\N	\N	\N	2600000	30	\N	t	f	\N	\N
5dca7df9-5f71-4a86-83a8-a2de80467625	NỐI TÓC NHUỘM MÀU BẰNG CHUN 70CM	70CHUNN	NỐI TÓC CHUN ( TẨY+ MÀU )	\N	\N	\N	2800000	30	\N	t	f	\N	\N
f1d97e6d-d270-47d7-a38a-05d5348c9c69	NỐI TÓC TẨY  BẰNG CHUN 50CM	50CHUNT	NỐI TÓC CHUN ( TẨY+ MÀU )	\N	\N	\N	2600000	30	\N	t	f	\N	\N
ab462b83-2448-4307-80c5-bd53fe47da9c	NỐI TÓC TẨY BẰNG CHUN 60CM	60CHUNT	NỐI TÓC CHUN ( TẨY+ MÀU )	\N	\N	\N	2800000	30	\N	t	f	\N	\N
ab7423f7-3de2-4505-9f3c-7a6fe9cfcd36	NỐI TÓC TẨY BẰNG CHUN 70CM	70CHUNT	NỐI TÓC CHUN ( TẨY+ MÀU )	\N	\N	\N	3000000	30	\N	t	f	\N	\N
621718fa-2547-4670-8c4b-ab6cbc8eb9c4	NỐI TÓC KIM TUYẾN NGANG VAI	KIMTUYEN	NỐI TÓC KIM TUYẾN	\N	\N	\N	30000	30	\N	t	f	\N	\N
c2ac8c62-45c6-4858-9498-f235adb409de	THÁO GEL BỘT	DV681536	NAIL	\N	\N	\N	160000	30	\N	t	f	\N	\N
6e6d776c-02a4-4da5-8e78-ea06242a46bf	RELAX FOOT 90P	F90	RELAX	\N	\N	\N	450000	30	\N	t	f	\N	\N
4cc4b07d-f44a-4cf1-a27e-a01663c5bbd1	RELAX  FOOT 120P	F120	RELAX	\N	\N	\N	600000	30	\N	t	f	\N	\N
ec5965d3-8fdf-43fe-bf9f-4943ab2f587c	RELAX  BODY 120P	B120	RELAX	\N	\N	\N	850000	30	\N	t	f	\N	\N
f4a4d244-8834-421c-b936-a53258d1b374	KEM LÀM MỀM CHÂN ( MỸ)	DV687905	RELAX	\N	\N	\N	50000	30	\N	t	f	\N	\N
6c39b991-b8c7-429b-b5ac-675770247fbd	PROFESSION OIL CLARINS FOOT	DV687919	RELAX	\N	\N	\N	150000	30	\N	t	f	\N	\N
f762b337-bf92-4b52-807f-4fed8e36db15	PROFESSION OIL DERMALOGICA  FOOT	DV687920	RELAX	\N	\N	\N	150000	30	\N	t	f	\N	\N
3cc69693-be02-4bfd-8b96-77f9d1f48516	RELAX TAY 40P	T40	RELAX	\N	\N	\N	160000	30	\N	t	f	\N	\N
0b1523e5-fa2f-4bf5-9e7b-1d91af46ba48	RELAX  CỔ - VAI - GÁY 40P	V40	RELAX	\N	\N	\N	280000	30	\N	t	f	\N	\N
9605026f-aa4a-4abe-b4e4-60d2784158f3	NÂNG MỐI NỐI TÓC LÔNG VŨ	NANGLV	NỐI TÓC LÔNG VŨ	\N	\N	\N	25000	30	\N	t	f	\N	\N
01ff702b-cea4-47db-aee1-038d2146a9e7	THÁO MỐI NỐI TÓC LÔNG VŨ / SỢI	THAOLV	NỐI TÓC LÔNG VŨ	\N	\N	\N	8000	30	\N	t	f	\N	\N
3052fb3e-e9b9-4e08-b40c-fec85142b05e	TRỪ THẺ TIỀN	THẺ	PHÍ	\N	\N	\N	0	30	\N	t	f	\N	\N
b7a5dde0-87f8-4226-81ed-7f5e5001ec18	MẶT NẠ CZ NÂNG CƠ	MẶT NẠ	FAICAL CZ	\N	\N	\N	550000	30	\N	t	f	\N	\N
48894246-17db-41cd-9ae4-eec3fc60a34a	MẶT NẠ CZ NHẠY CẢM	MẶT NẠ CZ	FAICAL CZ	\N	\N	\N	550000	30	\N	t	f	\N	\N
dbd52755-93b9-4449-bfc7-10e5803932bf	ĐÁNH BÓNG MÓNG	DV740833	NAIL	\N	\N	\N	80000	30	\N	t	f	\N	\N
a46f0569-eea0-477d-b354-a9b5fa0f6ec1	HYDRAMEMORY	CẤP ẨM	MẶT NẠ	\N	\N	\N	1299000	30	\N	t	f	\N	\N
184a0956-70db-488f-82bb-f6505826b480	REMEDY	NHẠY CẢM	MẶT NẠ	\N	\N	\N	1299000	30	\N	t	f	\N	\N
b40b8031-cb95-4b62-8845-380450fa4103	RECOVER TOUCH	DA KHÔ	MẶT NẠ	\N	\N	\N	1299000	30	\N	t	f	\N	\N
b181d35d-766d-452f-92c8-8228cbe09ac0	REMEDY INSENTIVE	DA NHẠY CẢM PHỤC HỒI	MẶT NẠ	\N	\N	\N	2999000	30	\N	t	f	\N	\N
07c72717-e8e7-43a4-b2a7-be9f87ef2381	SẤY STYLIST	SAT	SẤY VÀ TẠO KIỂU	\N	\N	\N	0	30	\N	t	f	\N	\N
ec359476-48c0-4047-ae46-e56a897d9080	NỐI TÓC LIGHT BẰNG CHUN 60CM	60CHUNL	NỐI TÓC CHUN ( TẨY+ MÀU )	\N	\N	\N	80000	30	\N	t	f	\N	\N
2f17b1bd-07fb-4966-8433-e510ad8da263	DƯỠNG MÓNG CND	CND	NAIL	\N	\N	\N	60000	30	\N	t	f	\N	\N
d9d6b365-6080-49b0-afa2-f33d6aad09f1	NỐI TÓC LIGHT BẰNG CHUN 65CM	70CHUNL	NỐI TÓC CHUN ( TẨY+ MÀU )	\N	\N	\N	90000	30	\N	t	f	\N	\N
8ecb36e3-8094-4857-9636-894100de1957	NỐI TÓC LIGHT BẰNG CHUN 50CM	50CHUNL	NỐI TÓC CHUN ( TẨY+ MÀU )	\N	\N	\N	70000	30	\N	t	f	\N	\N
d237782a-a9d9-41fa-afa3-b0adcd19dfc9	NỐI MÓNG	DV786832	NAIL	\N	\N	\N	500000	30	\N	t	f	\N	\N
811aa866-9c3a-45e2-8a8c-e02ecdc8d924	LIỆU TRÌNH CALESIM ( kích mọc tóc )	DV800138	LIỆU TRÌNH KÍCH MỌC TÓC	\N	\N	\N	12000000	30	\N	t	f	\N	\N
8e29cf9d-bc4e-4df3-b639-cffb712751fa	CHÀ GÓT CHÂN	DV800865	RELAX	\N	\N	\N	200000	30	\N	t	f	\N	\N
5c2df773-9bac-4255-8757-3514b3fee100	NỐI TÓC LÔNG VŨ ĐEN 60CM	60LVD	NỐI TÓC LÔNG VŨ	\N	\N	\N	60000	30	\N	t	f	\N	\N
a6675dfe-f7b8-4410-a15b-3ff38f970543	COMBO COMFOZONE	comfo	MẶT NẠ	\N	\N	\N	550000	30	\N	t	f	\N	\N
3c5ac9e6-868d-4c3e-a0a4-38da9b2abe9f	COMBO DERMALOGICA	dermalo	MẶT NẠ	\N	\N	\N	450000	30	\N	t	f	\N	\N
ecf3a29c-7172-45b7-bd0f-8e1e9cbd42b7	COMBO ESTHEPRO	esthe	MẶT NẠ	\N	\N	\N	350000	30	\N	t	f	\N	\N
d6882b60-b7ab-45d2-b54d-8cddda727b40	DỤNG CỤ CALESIM	DỤNG CỤ	LIỆU TRÌNH KÍCH MỌC TÓC	\N	\N	\N	350000	30	\N	t	f	\N	\N
e4c33f72-c8e2-40a9-9b9d-26e39dab1d47	LIỆU TRÌNH CALESIM ( kích mọc tóc ) lẻ	DV815220	LIỆU TRÌNH KÍCH MỌC TÓC	\N	\N	\N	2300000	30	\N	t	f	\N	\N
03de0c3e-d0c0-4fc8-b123-d88dacd4cf52	DỊCH VỤ  CALESIM ( kích mọc tóc ) ( 1/4 diện tích da đầu)	DV815223	LIỆU TRÌNH KÍCH MỌC TÓC	\N	\N	\N	800000	30	\N	t	f	\N	\N
efb2ce1a-84e0-4ea9-9764-593e38a62ed6	NUÔI DƯỠNG DA ĐẦU	NUÔI DƯỠNG	LIỆU TRÌNH KÍCH MỌC TÓC	\N	\N	\N	1000000	30	\N	t	f	\N	\N
68ce7514-13d5-435f-b939-3089a880413a	DỊCH VỤ  CALESIM ( kích mọc tóc ) ( 1/8 diện tích da đầu)	DV823190	LIỆU TRÌNH KÍCH MỌC TÓC	\N	\N	\N	600000	30	\N	t	f	\N	\N
07f8e420-e6eb-4983-b3bc-9e92b8d1ff8c	DỊCH VỤ  CALESIM	DV824048	LIỆU TRÌNH KÍCH MỌC TÓC	\N	\N	\N	1000000	30	\N	t	f	\N	\N
85ccece8-62c2-4e3b-910e-9b945b6249b1	NỐI TÓC LÔNG VŨ ĐEN 50CM	50LVD	NỐI TÓC LÔNG VŨ	\N	\N	\N	50000	30	\N	t	f	\N	\N
2cfa3c20-1dcf-4313-aeb3-e568382c84a8	MẶT NẠ HÀN	DV845272	NAIL	\N	\N	\N	260000	30	\N	t	f	\N	\N
5be3ab1a-80e4-4a67-aebf-8f62b83ad14f	NỐI TÓC LÔNG VŨ ĐEN 65CM	70LVD	NỐI TÓC LÔNG VŨ	\N	\N	\N	70000	30	\N	t	f	\N	\N
85cba6b8-d4a8-457d-bdb3-bffe7470e567	THÁO TÓC NỐI	THAONOI	NỐI TÓC	\N	\N	\N	500000	30	\N	t	f	\N	\N
f8d56f30-c799-400b-8d24-7a60d0d7e357	MN RỬA MẶT OHUI	ohui	FACIAL	\N	\N	\N	50000	30	\N	t	f	\N	\N
37421322-6894-40a5-b4c2-a8a1350e6de0	MN TẨY TBC HÀN	tbc hàn	FACIAL	\N	\N	\N	90000	30	\N	t	f	\N	\N
cdfae2bd-4da2-460c-8487-c03f893f7452	SẤY TÓC	SAY	THẺ	\N	\N	\N	0	30	\N	t	f	\N	\N
1fb9f374-e658-4bda-9c69-fa8193d4a717	7 SEC BONDS NỮ DÀI	7SNU	ADVANCED HAIR RESTORATION VÀ TREATMENT	\N	\N	\N	600000	30	\N	t	f	\N	\N
bca0a15c-990a-41c8-a3ef-37f813c1c9c6	7 SEC BONDS NAM	7SNA	ADVANCED HAIR RESTORATION VÀ TREATMENT	\N	\N	\N	350000	30	\N	t	f	\N	\N
10328c22-16ce-4d68-b04c-82ba4ca8275a	BỔ SUNG 20 PROTEIN NỮ DÀI	BS20PN	ADVANCED HAIR RESTORATION VÀ TREATMENT	\N	\N	\N	600000	30	\N	t	f	\N	\N
72b00d6f-0905-4603-93fc-d0eedd7e1fd3	BỔ SUNG 20 PROTEIN NAM	BS20PNA	ADVANCED HAIR RESTORATION VÀ TREATMENT	\N	\N	\N	350000	30	\N	t	f	\N	\N
56fb90da-e415-4873-b07b-171a6c34c2e7	CẮT TÓC NAM HAIR STYLIST HC	chcnas	CẮT TÓC THIẾT KẾ	\N	\N	\N	250000	30	\N	t	f	\N	\N
72608f9e-7a26-480f-bf9b-70b6e876d437	CẮT TÓC NỮ HAIR STYLIST HC	chcnus	CẮT TÓC THIẾT KẾ	\N	\N	\N	450000	30	\N	t	f	\N	\N
742aadac-8988-47f2-afa9-06a618b6fc60	CẮT TÓC NAM HAIR DESINGER HC	chcnad	CẮT TÓC THIẾT KẾ	\N	\N	\N	350000	30	\N	t	f	\N	\N
1da7e755-6a5a-4060-adfd-bca7ae146b13	CẮT TÓC NỮ HAIR DESINGER HC	chcnud	CẮT TÓC THIẾT KẾ	\N	\N	\N	550000	30	\N	t	f	\N	\N
c2fa6df6-aff5-4e6c-9ff3-748c42748465	CẮT TÓC NAM HAIR ARTIST HC	chcnaa	CẮT TÓC THIẾT KẾ	\N	\N	\N	450000	30	\N	t	f	\N	\N
ce9e343a-37c6-416f-98b1-5d72f4e5ca92	CẮT TÓC NỮ HAIR ARTIST HC	chcnua	CẮT TÓC THIẾT KẾ	\N	\N	\N	650000	30	\N	t	f	\N	\N
915428cc-aa1a-4edf-86b3-7970d1362b9a	CẮT TÓC NAM HAIR STYLIST CB 40P	ccbnas	CẮT TÓC THIẾT KẾ	\N	\N	\N	450000	30	\N	t	f	\N	\N
3e47dc59-038e-46a8-96fc-942a5c1067c8	CẮT TÓC NỮ HAIR STYLIST CB 40P	ccbnus	CẮT TÓC THIẾT KẾ	\N	\N	\N	650000	30	\N	t	f	\N	\N
2334233a-6d52-49a2-ab50-9797c6eb80ac	CẮT TÓC NAM HAIR DESINGER CB 40P	ccbnad	CẮT TÓC THIẾT KẾ	\N	\N	\N	500000	30	\N	t	f	\N	\N
ef6ac3f0-ae59-49f3-a4a9-43cb39db7bc5	CẮT TÓC NỮ HAIR DESINGER CB 60P	ccb60nud	CẮT TÓC THIẾT KẾ	\N	\N	\N	820000	30	\N	t	f	\N	\N
b1ab2aae-aa12-4ecb-a20d-d5c56e6f628b	CẮT TÓC NỮ HAIR STYLIST CB 60P	ccb60nus	CẮT TÓC THIẾT KẾ	\N	\N	\N	770000	30	\N	t	f	\N	\N
3db4f29d-56bd-4445-82ab-5f5922d4bba2	CẮT TÓC NAM HAIR STYLIST CB 60P	ccb60nas	CẮT TÓC THIẾT KẾ	\N	\N	\N	570000	30	\N	t	f	\N	\N
f7b45b7a-2da1-4547-af5c-c5416ea53fb1	CẮT TÓC NỮ  HAIR ARTIST CB 40P	ccbnua	CẮT TÓC THIẾT KẾ	\N	\N	\N	800000	30	\N	t	f	\N	\N
70460442-89fd-47e7-9b2c-b2194b645e7d	CẮT TÓC NAM HAIR ARTIST CB 40P	ccbnaa	CẮT TÓC THIẾT KẾ	\N	\N	\N	600000	30	\N	t	f	\N	\N
f6c8da90-a84e-40ca-9516-c3c54ec2cf53	CẮT TÓC NAM HAIR DESINGER CB 60P	ccb60nad	CẮT TÓC THIẾT KẾ	\N	\N	\N	620000	30	\N	t	f	\N	\N
56446464-610c-47a2-987c-bd4b00272151	CẮT TÓC NỮ NGẮN HAIR STYLIST CS 60P	ccs60nus	CẮT TÓC THIẾT KẾ	\N	\N	\N	920000	30	\N	t	f	\N	\N
f7d86ea5-ea82-4297-8917-c34285ad99d2	CẮT TÓC NAM HAIR ARTIST CB 60P	ccb60naa	CẮT TÓC THIẾT KẾ	\N	\N	\N	720000	30	\N	t	f	\N	\N
c6ba4c5b-03d6-403d-a49d-f05111da9a84	CẮT TÓC NAM HAIR STYLIST CS 40P	ccsnas	CẮT TÓC THIẾT KẾ	\N	\N	\N	550000	30	\N	t	f	\N	\N
229fa340-4f21-47b2-8544-6f356c2b6ec8	CẮT TÓC NỮ DÀI HAIR STYLIST CS 40P	ccsnus	CẮT TÓC THIẾT KẾ	\N	\N	\N	800000	30	\N	t	f	\N	\N
078bc3ca-f313-4a47-a869-d00eb0c1183d	CẮT TÓC NAM HAIR STYLIST CS 60P	ccs60nas	CẮT TÓC THIẾT KẾ	\N	\N	\N	670000	30	\N	t	f	\N	\N
fe1bb1a2-8e09-40f2-9508-117cf17c8360	CẮT TÓC NAM HAIR STYLIST CC  60P	ccc60nas	CẮT TÓC THIẾT KẾ	\N	\N	\N	820000	30	\N	t	f	\N	\N
ae08abf8-9341-4b20-bf9d-c94667b20ea5	CẮT TÓC NỮ DÀI HAIR STYLIST CC 60P	ccc60nus	CẮT TÓC THIẾT KẾ	\N	\N	\N	1120000	30	\N	t	f	\N	\N
ecd25763-75c7-443a-8813-e419ba38a8fc	MAKEUP	MAKEUP	MAKEUP & BỚI TÓC	\N	\N	\N	600000	30	\N	t	f	\N	\N
32c2059e-8e9d-42af-bb3a-3550a6e9298a	CẮT TÓC NAM HAIR STYLIST CC 40P	cccnas	CẮT TÓC THIẾT KẾ	\N	\N	\N	700000	30	\N	t	f	\N	\N
bd1b9844-5747-41a0-ad67-7874b5f5798e	CẮT TÓC NỮ DÀI HAIR STYLIST CC 40P	cccnus	CẮT TÓC THIẾT KẾ	\N	\N	\N	1000000	30	\N	t	f	\N	\N
7accafd1-bfa6-4054-8f23-79e6e338c26b	CẮT TÓC NỮ  HAIR DESINGER CB 40P	ccbnud	CẮT TÓC THIẾT KẾ	\N	\N	\N	700000	30	\N	t	f	\N	\N
afae456e-941f-4dfe-a311-ed05adf11843	CẮT TÓC NAM HAIR DESINGER CS 40P	ccsnad	CẮT TÓC THIẾT KẾ	\N	\N	\N	600000	30	\N	t	f	\N	\N
4e022af8-c992-49f6-bf80-5642cd661b18	CẮT TÓC NỮ DÀI HAIR DESINGER CS 40P	ccsnud	CẮT TÓC THIẾT KẾ	\N	\N	\N	850000	30	\N	t	f	\N	\N
ec006404-66cc-45e1-83c3-8f82c90c877b	CẮT TÓC NỮ DÀI HAIR DESINGER CS 60P	ccs60nud	CẮT TÓC THIẾT KẾ	\N	\N	\N	970000	30	\N	t	f	\N	\N
6b3e0ce2-570f-41e1-9906-5d65cf75841e	CẮT TÓC NAM HAIR DESINGER CS 60P	ccs60nad	CẮT TÓC THIẾT KẾ	\N	\N	\N	720000	30	\N	t	f	\N	\N
4eb4fbb6-88a0-4932-986b-5ad27d804fa7	CẮT TÓC NAM HAIR DESINGER CC 40P	cccnad	CẮT TÓC THIẾT KẾ	\N	\N	\N	750000	30	\N	t	f	\N	\N
ee86448f-eb8a-4509-a643-dd368dc278bd	CẮT TÓC NỮ DÀI HAIR DESINGER CC 40P	cccnud	CẮT TÓC THIẾT KẾ	\N	\N	\N	1050000	30	\N	t	f	\N	\N
40bbc515-1b12-444d-81ec-25d82580b222	CẮT TÓC NAM HAIR DESINGER CC 60P	ccc60nad	CẮT TÓC THIẾT KẾ	\N	\N	\N	870000	30	\N	t	f	\N	\N
dd67739e-9536-454c-be83-38e655aeb10a	CẮT TÓC NỮ DÀI HAIR DESINGER CC 60P	ccc60nud	CẮT TÓC THIẾT KẾ	\N	\N	\N	1170000	30	\N	t	f	\N	\N
9de8d305-05d5-45fe-bd14-ebb943c2e2b7	CẮT TÓC NỮ DÀI HAIR ARTIST CC 40P	cccnua	CẮT TÓC THIẾT KẾ	\N	\N	\N	1150000	30	\N	t	f	\N	\N
d89ebd6d-f8af-4508-a25c-5a701a713e86	CẮT TÓC NỮ DÀI HAIR ARTIST CS 40P	ccsnua	CẮT TÓC THIẾT KẾ	\N	\N	\N	950000	30	\N	t	f	\N	\N
872a80fe-92ba-444b-a390-5d7acfdd4bd5	CẮT TÓC NAM HAIR ARTIST CS 40P	ccsnaa	CẮT TÓC THIẾT KẾ	\N	\N	\N	700000	30	\N	t	f	\N	\N
dc73dabe-3b8e-4e92-a318-b29ff87a9e9b	CẮT TÓC NAM HAIR ARTIST CC 40P	cccnaa	CẮT TÓC THIẾT KẾ	\N	\N	\N	850000	30	\N	t	f	\N	\N
a9a499d0-64a7-4bd0-a5e8-032b31d94eb3	CẮT TÓC NỮ HAIR ARTIST CB 60P	ccb60nua	CẮT TÓC THIẾT KẾ	\N	\N	\N	920000	30	\N	t	f	\N	\N
bb5bddf7-fc10-49d3-ac75-cfe1992cb918	CẮT TÓC NAM HAIR ARTIST CC 60P	ccc60naa	CẮT TÓC THIẾT KẾ	\N	\N	\N	970000	30	\N	t	f	\N	\N
4ed5f6a2-0655-4666-8c9e-c4d0f8f8e541	CẮT TÓC NAM HAIR ARTIST CS 60P	ccs60naa	CẮT TÓC THIẾT KẾ	\N	\N	\N	820000	30	\N	t	f	\N	\N
3e39afb5-1208-4ee3-93b7-5891e9de5633	CẮT TÓC NỮ DÀI HAIR ARTIST CC 60P	ccc60nua	CẮT TÓC THIẾT KẾ	\N	\N	\N	1270000	30	\N	t	f	\N	\N
21ee0ac4-a02c-4291-a3f5-8f3b549c253c	CẮT TÓC NỮ DÀI HAIR ARTIST CS 60P	ccs60nua	CẮT TÓC THIẾT KẾ	\N	\N	\N	1070000	30	\N	t	f	\N	\N
016d0e9a-8c69-4161-a082-0ac05909f198	CẮT TÓC BÉ TRAI	CBT	CẮT TÓC CHO BÉ	\N	\N	\N	160000	30	\N	t	f	\N	\N
05e80c6e-4cfb-4c7b-b60c-c9bb75885403	CẮT TÓC BÉ GÁI	CBG	CẮT TÓC CHO BÉ	\N	\N	\N	200000	30	\N	t	f	\N	\N
fe7efb11-a7aa-454e-b7d4-284738d9e021	SẤY VÀ TẠO KIỂU TÓC NAM	SAYNA	SẤY VÀ TẠO KIỂU	\N	\N	\N	50000	30	\N	t	f	\N	\N
6f11b030-6e60-4a62-923c-3d680946a75a	SẤY VÀ TẠO KIỂU TÓC TÉM & NGẮN	SAYT	SẤY VÀ TẠO KIỂU	\N	\N	\N	150000	30	\N	t	f	\N	\N
b15426e1-2213-4ce3-bd66-26737a6d3784	SẤY VÀ TẠO KIỂU TÓC VỪA VÀ DÀI	SAYVD	SẤY VÀ TẠO KIỂU	\N	\N	\N	200000	30	\N	t	f	\N	\N
4d4fc6f7-83bc-4a20-a23a-0a88b35ef8fa	GỘI THƯ GIÃN NAM CB 40P	GCBNA	GỘI VÀ THƯ GIÃN	\N	\N	\N	200000	30	\N	t	f	\N	\N
bf960c6a-acca-42a9-82d7-a4d852fe01b4	GỘI THƯ GIÃN NAM CS 40P	GCSNA	GỘI VÀ THƯ GIÃN	\N	\N	\N	300000	30	\N	t	f	\N	\N
00d682ea-d515-42a6-b7cd-0a1ef5dd4b78	GỘI THƯ GIÃN NAM CC 40P	GCCNA	GỘI VÀ THƯ GIÃN	\N	\N	\N	450000	30	\N	t	f	\N	\N
b20518f4-17c3-48fb-9f7e-80a43e353be4	GỘI THƯ GIÃN NỮ CB 40P	GCBNU	GỘI VÀ THƯ GIÃN	\N	\N	\N	250000	30	\N	t	f	\N	\N
b57660db-7dd0-4bbe-927d-33ee20664237	GỘI THƯ GIÃN NỮ DÀI CS 40P	GCSNU	GỘI VÀ THƯ GIÃN	\N	\N	\N	400000	30	\N	t	f	\N	\N
04253987-491e-466e-8708-3c1a47ed1c48	GỘI THƯ GIÃN NỮ DÀI CC 40P	GCCNU	GỘI VÀ THƯ GIÃN	\N	\N	\N	600000	30	\N	t	f	\N	\N
8102400b-043d-401c-b587-2ea3be3981f0	GỘI THƯ GIÃN NAM CB 60P	GCB60NA	GỘI VÀ THƯ GIÃN	\N	\N	\N	320000	30	\N	t	f	\N	\N
1b5d9729-1f20-456a-96fe-61716bec2f2e	GỘI THƯ GIÃN NAM CS 60P	GCS60NA	GỘI VÀ THƯ GIÃN	\N	\N	\N	420000	30	\N	t	f	\N	\N
4b97663e-a7c4-4234-bf51-5ce237e4ac57	GỘI THƯ GIÃN NAM CC 60P	GCC60NA	GỘI VÀ THƯ GIÃN	\N	\N	\N	570000	30	\N	t	f	\N	\N
a6e4f40f-5a0c-4f0d-96e6-e796571de27f	GỘI THƯ GIÃN NỮ DÀI CC 60P	GCC60NU	GỘI VÀ THƯ GIÃN	\N	\N	\N	720000	30	\N	t	f	\N	\N
c1e7005a-2f21-4388-ac08-70b59990711e	GỘI THƯ GIÃN NỮ CB 60P	GCB60NU	GỘI VÀ THƯ GIÃN	\N	\N	\N	370000	30	\N	t	f	\N	\N
35c836e9-32c0-4e8b-abf2-54d095f12b1c	GỘI THƯ GIÃN NỮ DÀI CS 60P	gcs60nu	GỘI VÀ THƯ GIÃN	\N	\N	\N	520000	30	\N	t	f	\N	\N
7d401198-a52a-48bd-af77-9c267c323c12	TẨY TBC DA ĐẦU AVEDA	TBCAV	TẨY TẾ BÀO CHẾT DA ĐẦU	\N	\N	\N	600000	30	\N	t	f	\N	\N
ccfc21c9-0af8-4c4f-9785-7e95a6250cd5	TẨY TBC DA ĐẦU KERASTASE THƯỜNG / NHẠY CẢM	TBCK	TẨY TẾ BÀO CHẾT DA ĐẦU	\N	\N	\N	450000	30	\N	t	f	\N	\N
ef81ecd8-ed4c-4753-a381-9cc222a68ca1	TẨY TBC DA ĐẦU BIOTERA	TBCBI	TẨY TẾ BÀO CHẾT DA ĐẦU	\N	\N	\N	350000	30	\N	t	f	\N	\N
611dd165-232c-4d14-9613-687d26f6a122	TẨY TBC DA ĐẦU NUMBER 3	TBC3	TẨY TẾ BÀO CHẾT DA ĐẦU	\N	\N	\N	250000	30	\N	t	f	\N	\N
f6739aac-1d59-41bd-acc3-9bd00527ad18	NUÔI DƯỠNG DA ĐẦU AMPOULE	AMP	NUÔI DƯỠNG DA ĐẦU	\N	\N	\N	250000	30	\N	t	f	\N	\N
6a8eb6c6-9435-4667-8f3a-5eed92b04fce	MẶT NẠ HÚT BÃ NHỜN KERASTASE	HBNK	NUÔI DƯỠNG DA ĐẦU	\N	\N	\N	350000	30	\N	t	f	\N	\N
86db2658-d21e-40e5-89c2-5a32061a7399	MẶT NẠ PHỤC HỒI DA ĐẦU KERASTASE	MẶT NẠ KERAS	NUÔI DƯỠNG DA ĐẦU	\N	\N	\N	350000	30	\N	t	f	\N	\N
fc032e93-e0a8-4cd2-866f-11035c9d3839	PEEL DA ĐẦU KERASTASE	PEEL	NUÔI DƯỠNG DA ĐẦU	\N	\N	\N	350000	30	\N	t	f	\N	\N
154f232e-22fc-4565-adfe-9192ddc2661c	BẢO VỆ DA ĐẦU NARAXIS ESENZA	BVDĐN	BẢO VỆ DA ĐẦU	\N	\N	\N	500000	30	\N	t	f	\N	\N
aa40f645-47e0-49a9-a585-4d741efa2a4f	HẤP DẦU NAM JOICO	HDJNA	MASK VÀ TREATMENT	\N	\N	\N	300000	30	\N	t	f	\N	\N
b65069d8-60ea-4f44-b1ec-712977acb5bd	HẤP DẦU NỮ DÀI JOICO	HDJNU	MASK VÀ TREATMENT	\N	\N	\N	550000	30	\N	t	f	\N	\N
dc850a89-33e7-44b2-a4b6-88fe1e1d0f78	HẤP DẦU NỮ DÀI KERASTASE	HDKNU	MASK VÀ TREATMENT	\N	\N	\N	750000	30	\N	t	f	\N	\N
e26ff2e7-087a-462c-97ef-16eff83b6d5e	HẤP DẦU NAM KERASTASE	HDKNA	MASK VÀ TREATMENT	\N	\N	\N	500000	30	\N	t	f	\N	\N
9565208d-cb88-4e31-b895-e983166a3df6	HẤP DẦU NỮ DÀI AVEDA	HDAVNU	MASK VÀ TREATMENT	\N	\N	\N	950000	30	\N	t	f	\N	\N
9d15f1db-b116-4414-a0e0-d25d92b55e78	HẤP DẦU NAM AVEDA	HDAVNA	MASK VÀ TREATMENT	\N	\N	\N	700000	30	\N	t	f	\N	\N
094b9c7b-5b8f-48f3-93a9-495d985e6160	PHỤC HỒI NAM JOICO	PHJNA	MASK VÀ TREATMENT	\N	\N	\N	500000	30	\N	t	f	\N	\N
39c31b73-8599-43c7-a503-582b3aac7a46	PHỤC HỒI NỮ DÀI JOICO	PHJNU	MASK VÀ TREATMENT	\N	\N	\N	1200000	30	\N	t	f	\N	\N
9faae9e4-04e2-4b22-bea6-0b459c983c4f	PHỤC HỒI NAM MILBON	PHMNA	MASK VÀ TREATMENT	\N	\N	\N	500000	30	\N	t	f	\N	\N
cc63068f-e600-478e-beba-75a9d113dabe	PHỤC HỒI NỮ DÀI MILBON	PHMNU	MASK VÀ TREATMENT	\N	\N	\N	1200000	30	\N	t	f	\N	\N
27e84e03-4f48-4534-b0de-c5d119f84437	PHỤC HỒI NAM AVEDA	PHAVNA	MASK VÀ TREATMENT	\N	\N	\N	900000	30	\N	t	f	\N	\N
a912a37d-9b06-4f67-89ea-c3d656faf74a	PHỤC HỒI NỮ DÀI AVEDA	PHAVNU	MASK VÀ TREATMENT	\N	\N	\N	1600000	30	\N	t	f	\N	\N
9811ce5b-8e10-41de-97e5-2d2cb9504456	PHỤC HỒI NAM KERATIN	PHKNA	MASK VÀ TREATMENT	\N	\N	\N	1200000	30	\N	t	f	\N	\N
bfc107e0-a549-4b57-8e4b-5026176ea196	PHỤC HỒI NỮ DÀI KERATIN	PHKNU	PHỤC HỒI KERATIN	\N	\N	\N	2600000	30	\N	t	f	\N	\N
53f49ab2-203c-42c0-ba0e-93f95e1db479	AMPOULE BẢO VỆ SỢI TÓC NAM	AMNA	MASK VÀ TREATMENT	\N	\N	\N	250000	30	\N	t	f	\N	\N
fba69021-be4f-407e-9340-2549134a9c87	AMPOULE BẢO VỆ SỢI TÓC NỮ	AMNU	MASK VÀ TREATMENT	\N	\N	\N	250000	30	\N	t	f	\N	\N
6989d26b-e09d-4172-9454-6943566c4a93	AMINO AXIT CHÂN TÓC NAM	AXCNA	ADVANCED HAIR RESTORATION VÀ TREATMENT	\N	\N	\N	300000	30	\N	t	f	\N	\N
65a1d231-d365-4893-ae42-dc02511792ca	AMINO AXIT NGỌN NAM	AANNA	ADVANCED HAIR RESTORATION VÀ TREATMENT	\N	\N	\N	300000	30	\N	t	f	\N	\N
8b4a2070-d22c-46d3-98af-5e0cd9a6032c	AMINO AXIT FULL NAM	AXFNA	ADVANCED HAIR RESTORATION VÀ TREATMENT	\N	\N	\N	600000	30	\N	t	f	\N	\N
f37a28e9-4265-42c0-868c-9bf5fc849e68	AMINO AXIT CHÂN TÓC  NỮ	AXCNU	ADVANCED HAIR RESTORATION VÀ TREATMENT	\N	\N	\N	300000	30	\N	t	f	\N	\N
de2186ff-4b40-4b03-a790-2a6c0c3b4ea4	AMINO AXIT NGỌN  NỮ	AANNU	ADVANCED HAIR RESTORATION VÀ TREATMENT	\N	\N	\N	300000	30	\N	t	f	\N	\N
a2d0e1c4-1700-4567-99bc-ec94a4438637	AMINO AXIT FULL NỮ LONG	AXFNU	ADVANCED HAIR RESTORATION VÀ TREATMENT	\N	\N	\N	1200000	30	\N	t	f	\N	\N
de4130ec-f43d-4510-9a3a-d4329170ac5d	DEFY DAMAGE PRO SERIES 1+2 CHÂN TÓC NAM	DDPCNA	ADVANCED HAIR RESTORATION VÀ TREATMENT	\N	\N	\N	600000	30	\N	t	f	\N	\N
5492816b-4a69-4688-a6ee-8a7707d2c1ee	DEFY DAMAGE PRO SERIES 1+2 CHÂN TÓC / NGỌN NỮ	DDPCN	ADVANCED HAIR RESTORATION VÀ TREATMENT	\N	\N	\N	600000	30	\N	t	f	\N	\N
6012f4cf-7f66-40dc-91ba-767e13a5d0ca	Ủ KERATIN NỮ DÀI	UKNu	ADVANCED HAIR RESTORATION VÀ TREATMENT	\N	\N	\N	1200000	30	\N	t	f	\N	\N
2d25e4e0-35fb-4c3c-bc43-64a824403736	Ủ KERATIN NAM	UKNA	ADVANCED HAIR RESTORATION VÀ TREATMENT	\N	\N	\N	500000	30	\N	t	f	\N	\N
9ff05be5-36a4-4ca5-95e5-bf85202a0b6c	DUỖI TÓC NAM HAIR STYLIST (perm straight / curl)	DUSNA	HÓA CHẤT NAM	\N	\N	\N	650000	30	\N	t	f	\N	\N
1f35fe0b-61fa-4593-a113-b94fcec5fcdf	UỐN TÓC NAM HAIR DESIGNER (perm straight / curl)	UDNA	HÓA CHẤT NAM	\N	\N	\N	780000	30	\N	t	f	\N	\N
c0609d87-a552-4f9a-985c-907690d00ba8	DUỖI TÓC NAM HAIR DESIGNER (perm straight / curl)	DUDNA	HÓA CHẤT NAM	\N	\N	\N	780000	30	\N	t	f	\N	\N
9e3e669e-ad9f-44f6-a836-c5f914f13964	DUỖI TÓC NAM HAIR ARTIST (perm straight / curl)	DUANA	HÓA CHẤT NAM	\N	\N	\N	950000	30	\N	t	f	\N	\N
4330c134-5429-4625-856b-f5c64c0eac58	UỐN TÓC NAM HAIR ARTIST (perm straight / curl)	UANA	HÓA CHẤT NAM	\N	\N	\N	950000	30	\N	t	f	\N	\N
83489cf9-0eaa-4e4b-9f0c-4052c0b334f6	UỐN TÓC NAM HAIR STYLIST (perm straight / curl)	USNA	HÓA CHẤT NAM	\N	\N	\N	650000	30	\N	t	f	\N	\N
e0ccfb72-9d62-463c-9f6a-950c6c6c2383	DUỖI CHÂN TÓC HAIR STYLIST	DC1S	CHÂN TÓC	\N	\N	\N	600000	30	\N	t	f	\N	\N
00036a69-4165-4dc1-af55-44fdc486a961	UỐN CHÂN TÓC HAIR STYLIST	UC1S	CHÂN TÓC	\N	\N	\N	600000	30	\N	t	f	\N	\N
b862306b-fefa-4f69-a43b-1fd19bc8023d	UỐN CHÂN TÓC HAIR STYLIST (công nghệ Aquaperm)	UCS	CHÂN TÓC	\N	\N	\N	900000	30	\N	t	f	\N	\N
02740929-87d5-47b1-8521-6992632b391d	DUỖI CHÂN TÓC HAIR STYLIST (công nghệ Aquaperm)	DCS	CHÂN TÓC	\N	\N	\N	900000	30	\N	t	f	\N	\N
c2e8eded-8deb-4833-80ef-3cbdf75b86b4	DUỖI CHÂN TÓC HAIR DESIGNER	DC1D	CHÂN TÓC	\N	\N	\N	750000	30	\N	t	f	\N	\N
f087ea59-ee9d-445c-978f-62a00426c6d7	UỐN CHÂN TÓC HAIR DESIGNER	UC1D	CHÂN TÓC	\N	\N	\N	750000	30	\N	t	f	\N	\N
55d7905c-c351-4fd6-956a-6a665aec8b82	DUỖI CHÂN TÓC HAIR DESIGNER (công nghệ Aquaperm)	DCD	CHÂN TÓC	\N	\N	\N	1050000	30	\N	t	f	\N	\N
69d690a3-0265-4cde-ac87-3a014346a4c2	UỐN CHÂN TÓC HAIR DESIGNER (công nghệ Aquaperm)	UCD	CHÂN TÓC	\N	\N	\N	1050000	30	\N	t	f	\N	\N
c9aff2c5-0218-46f3-a114-4976628e3c8e	UỐN CHÂN TÓC HAIR ARTIST	UC1A	CHÂN TÓC	\N	\N	\N	850000	30	\N	t	f	\N	\N
525d56bc-1ba3-4f88-bd5e-46e165f60c22	DUÔI CHÂN TÓC HAIR ARTIST	DC1A	CHÂN TÓC	\N	\N	\N	850000	30	\N	t	f	\N	\N
e3cfb6b5-d7b2-4351-a33f-97c2aba49de5	UỐN CHÂN TÓC HAIR ARTIST (công nghệ Aquaperm)	UCA	CHÂN TÓC	\N	\N	\N	1150000	30	\N	t	f	\N	\N
2efe8de2-b8bf-4d8c-8bd7-7d4a5ff4bffe	DUÔI CHÂN TÓC HAIR ARTIST (công nghệ Aquaperm)	DCA	CHÂN TÓC	\N	\N	\N	1150000	30	\N	t	f	\N	\N
e66bbbe4-ebe9-4e4d-aa65-a457f76f9cc0	UỐN TÓC MÁI HAIR STYLIST	UMS	MÁI VÀ ÉP SIDE	\N	\N	\N	250000	30	\N	t	f	\N	\N
2d849d37-b463-4009-9e93-6338c702e778	DUỖI TÓC MÁI HAIR STYLIST	DMS	MÁI VÀ ÉP SIDE	\N	\N	\N	250000	30	\N	t	f	\N	\N
2c11ce76-3de6-46dd-9b38-dc3c55ba82d0	XÓA MÁI HAIR STYLIST	XMS	MÁI VÀ ÉP SIDE	\N	\N	\N	250000	30	\N	t	f	\N	\N
594ea7ff-7ef3-4aed-9f11-3815555ee5db	ÉP SIDE HAIR STYLIST	ESS	MÁI VÀ ÉP SIDE	\N	\N	\N	250000	30	\N	t	f	\N	\N
b29fab37-6544-4664-8368-946927d8a0dc	DUỖI TÓC MÁI HAIR DESIGNER	DMD	MÁI VÀ ÉP SIDE	\N	\N	\N	300000	30	\N	t	f	\N	\N
b06cc673-dbc1-4281-8d52-b9a61dbeafd6	UỐN TÓC MÁI HAIR DESIGNER	UMD	MÁI VÀ ÉP SIDE	\N	\N	\N	300000	30	\N	t	f	\N	\N
4c04053a-f311-4ada-966f-c3494f6e9417	XÓA MÁI HAIR DESIGNER (công nghệ Aquaperm)	XMD	MÁI VÀ ÉP SIDE	\N	\N	\N	350000	30	\N	t	f	\N	\N
f87f0dbd-5d2e-4e65-9655-3ddd6d308851	ÉP SIDE HAIR DESIGNER	ESD	MÁI VÀ ÉP SIDE	\N	\N	\N	300000	30	\N	t	f	\N	\N
d67cf929-8a25-47ea-8079-139b1fde0aa5	DUỖI TÓC MÁI HAIR ARTIST	DMA	MÁI VÀ ÉP SIDE	\N	\N	\N	350000	30	\N	t	f	\N	\N
02157af1-24b7-44ac-b792-30aeadec1486	ÉP SIDE HAIR ARTIST (công nghệ Aquaperm)	ESA	MÁI VÀ ÉP SIDE	\N	\N	\N	400000	30	\N	t	f	\N	\N
6219e7f3-ae2e-4abb-b6bc-412fe3b6abb8	XÓA MÁI HAIR ARTIST(công nghệ Aquaperm)	XMA	MÁI VÀ ÉP SIDE	\N	\N	\N	400000	30	\N	t	f	\N	\N
59610748-1cac-4070-8c58-33be2c96e4d3	UỐN TÓC MÁI HAIR ARTIST	UMA	MÁI VÀ ÉP SIDE	\N	\N	\N	350000	30	\N	t	f	\N	\N
416bafce-4068-401d-899d-7050c930cd9b	NHUỘM TÓC NAM HAIR STYLIST (công nghệ PH & Cortex)	NSNAPH	HÓA CHẤT NAM	\N	\N	\N	800000	30	\N	t	f	\N	\N
5b7abbbc-bd5b-43ff-9bbd-fa5abacdf2dc	NHUỘM TÓC VỪA HAIR STYLIST (công nghệ PH & Cortex)	NSVPH	HÓA CHẤT NỮ VỪA	\N	\N	\N	1900000	30	\N	t	f	\N	\N
8f50a062-ca92-4287-9025-824bfb0726a2	NHUỘM TÓC NAM HAIR ARTIST (công nghệ PH & Cortex)	NANAPH	HÓA CHẤT NAM	\N	\N	\N	1100000	30	\N	t	f	\N	\N
897a98a4-6206-4054-804c-d165fdce91d4	NHUỘM TÓC NAM HAIR DESIGNER (công nghệ PH & Cortex)	NDNAPH	HÓA CHẤT NAM	\N	\N	\N	950000	30	\N	t	f	\N	\N
31c7410b-62a1-45ce-9b21-046606f49569	NHUỘM TÓC NAM HAIR DESIGNER	N1DNA	HÓA CHẤT NAM	\N	\N	\N	850000	30	\N	t	f	\N	\N
d38a6d1e-318f-4164-bf8b-fa4152800122	NHUỘM TÓC NAM HAIR ARTIST	N1ANA	HÓA CHẤT NAM	\N	\N	\N	1000000	30	\N	t	f	\N	\N
e9c01dea-692d-43cd-a118-8fab2e6e49ad	NHUỘM TÓC NAM HAIR STYLIST	N1SNA	HÓA CHẤT NAM	\N	\N	\N	700000	30	\N	t	f	\N	\N
36bb5910-392c-442b-a982-5e07f761349f	NHUỘM TÓC NAM THUẦN CHAY AVEDA HAIR DESIGNER	NAVDNA	HÓA CHẤT NAM	\N	\N	\N	1400000	30	\N	t	f	\N	\N
8b5bb865-e614-43cd-8013-04f8154e2dea	NHUỘM TÓC NAM THUẦN CHAY AVEDA HAIR ARTIST	NAVANA	HÓA CHẤT NAM	\N	\N	\N	1600000	30	\N	t	f	\N	\N
d4afdbe4-4cda-4af3-98a0-9fc3c5e04d11	NHUỘM TÓC NAM THUẦN CHAY AVEDA HAIR STYLIST	NAVSNA	HÓA CHẤT NAM	\N	\N	\N	1100000	30	\N	t	f	\N	\N
2d645667-8106-4c5d-bcdc-791f03b6fd75	NHUỘM CHÂN TÓC NAM THUẦN CHAY AVEDA HAIR STYLIST	NCAVSNA	HÓA CHẤT NAM	\N	\N	\N	900000	30	\N	t	f	\N	\N
e4398892-cd98-425d-87cf-78e7dd7646ac	NHUỘM CHÂN TÓC NAM HAIR DESIGNER	NC1DNA	HÓA CHẤT NAM	\N	\N	\N	850000	30	\N	t	f	\N	\N
12e2f941-3745-4e63-bc26-ffffcd964eed	NHUỘM CHÂN TÓC NAM HAIR STYLIST	NC1SNA	HÓA CHẤT NAM	\N	\N	\N	700000	30	\N	t	f	\N	\N
137e2cad-e5ed-44e2-b50b-b54d5bae0c91	NHUỘM CHÂN TÓC NAM HAIR ARTIST	NC1ANA	HÓA CHẤT NAM	\N	\N	\N	1000000	30	\N	t	f	\N	\N
586a4251-3527-4062-9c1a-d0bdd1aeb98f	NHUỘM CHÂN TÓC NAM HAIR DESIGNER (công nghệ PH & Cortex)	NCDNAPH	HÓA CHẤT NAM	\N	\N	\N	950000	30	\N	t	f	\N	\N
8c7c47cb-512e-471a-b70b-ac58033949bb	NHUỘM CHÂN TÓC NAM HAIR ARTIST (công nghệ PH & Cortex)	NCANAPH	HÓA CHẤT NAM	\N	\N	\N	1100000	30	\N	t	f	\N	\N
d3ac6c5a-38bd-442a-98c5-a31275d191bd	NHUỘM CHÂN TÓC NAM HAIR STYLIST (công nghệ PH & Cortex)	NCSNAPH	HÓA CHẤT NAM	\N	\N	\N	800000	30	\N	t	f	\N	\N
b5f09ec2-bdfe-4fe1-9fc0-e7f4d297c7c3	NHUỘM CHÂN TÓC NAM THUẦN CHAY AVEDA HAIR DESIGNER	NCAVDNA	HÓA CHẤT NAM	\N	\N	\N	1100000	30	\N	t	f	\N	\N
81b16d34-1b3e-49d4-ac88-3922bae98d8f	NHUỘM CHÂN TÓC NAM THUẦN CHAY AVEDA HAIR ARTIST	NCAVANA	HÓA CHẤT NAM	\N	\N	\N	1300000	30	\N	t	f	\N	\N
7e2bcd5a-8747-41c4-8223-f1337f25d8e8	NHUỘM TÓC VỪA HAIR ARTIST	N1AV	HÓA CHẤT NỮ VỪA	\N	\N	\N	2200000	30	\N	t	f	\N	\N
576611ac-cff3-454a-9173-526a45d04ae6	NHUỘM TÓC VỪA HAIR ARTIST (công nghệ PH & Cortex)	NAVPH	HÓA CHẤT NỮ VỪA	\N	\N	\N	2600000	30	\N	t	f	\N	\N
495d0d08-0d17-4c0a-ae08-00c54c6e6fca	NHUỘM TÓC VỪA HAIR STYLIST	N1SV	HÓA CHẤT NỮ VỪA	\N	\N	\N	1500000	30	\N	t	f	\N	\N
5c5fe6c2-61ae-48f7-8382-ea5bd77b1862	NHUỘM TÓC VỪA HAIR DESIGNER	N1DV	HÓA CHẤT NỮ VỪA	\N	\N	\N	1800000	30	\N	t	f	\N	\N
a034e318-efcf-4f7e-ae92-b5e3bac33bfd	NHUỘM TÓC VỪA HAIR DESIGNER (công nghệ PH & Cortex)	NDVPH	HÓA CHẤT NỮ VỪA	\N	\N	\N	2200000	30	\N	t	f	\N	\N
7bcffeaa-c993-4730-9191-cf87da53a8e1	NHUỘM TÓC TÉM HAIR STYLIST	N1ST	HÓA CHẤT NỮ TÉM	\N	\N	\N	1000000	30	\N	t	f	\N	\N
50980e3a-cb59-48f9-a28f-065273138dea	NHUỘM TÓC TÉM HAIR STYLIST (công nghệ PH & Cortex)	NSTPH	HÓA CHẤT NỮ TÉM	\N	\N	\N	1200000	30	\N	t	f	\N	\N
a5480177-8bf1-4844-a79b-8a3479232949	NHUỘM TÓC TÉM HAIR DESIGNER	N1DT	HÓA CHẤT NỮ TÉM	\N	\N	\N	1200000	30	\N	t	f	\N	\N
29b430d9-112a-413a-ba47-fc07f7726d09	NHUỘM TÓC TÉM HAIR DESIGNER (công nghệ PH & Cortex)	NDTPH	HÓA CHẤT NỮ TÉM	\N	\N	\N	1400000	30	\N	t	f	\N	\N
04f8ce2e-ebbd-448d-a5e3-32755fa91651	NHUỘM TÓC TÉM HAIR ARTIST (công nghệ PH & Cortex)	NATPH	HÓA CHẤT NỮ TÉM	\N	\N	\N	1700000	30	\N	t	f	\N	\N
0279d9c9-9c6c-46a3-b303-288fc46b8676	NHUỘM TÓC TÉM HAIR ARTIST	N1AT	HÓA CHẤT NỮ TÉM	\N	\N	\N	1500000	30	\N	t	f	\N	\N
3ec66c6f-ccdf-4dc8-a115-c85f6836dfc2	NHUỘM TÓC NGẮN HAIR STYLIST	N1SNG	HÓA CHẤT NỮ NGẮN	\N	\N	\N	1200000	30	\N	t	f	\N	\N
c8ddcd81-ab5e-46d7-840f-c8afe2afac66	NHUỘM TÓC NGẮN HAIR STYLIST (công nghệ PH & Cortex)	NSNGPH	HÓA CHẤT NỮ NGẮN	\N	\N	\N	1500000	30	\N	t	f	\N	\N
4f76ead0-6233-4f58-8cdb-706c53e6e416	NHUỘM TÓC NGẮN HAIR ARTIST (công nghệ PH & Cortex)	NANGPH	HÓA CHẤT NỮ NGẮN	\N	\N	\N	2100000	30	\N	t	f	\N	\N
f6522202-a9e1-486f-abcb-04bb63d13981	NHUỘM TÓC NGẮN HAIR ARTIST	N1ANG	HÓA CHẤT NỮ NGẮN	\N	\N	\N	1800000	30	\N	t	f	\N	\N
fae2590b-4e9b-4089-83b0-2c8828b49760	NHUỘM TÓC NGẮN HAIR DESIGNER	N1DNG	HÓA CHẤT NỮ NGẮN	\N	\N	\N	1500000	30	\N	t	f	\N	\N
dd1612f9-3f67-4489-bfec-1c25f5d0a34c	NHUỘM TÓC NGẮN HAIR DESIGNER (công nghệ PH & Cortex)	NDNGPH	HÓA CHẤT NỮ NGẮN	\N	\N	\N	1800000	30	\N	t	f	\N	\N
2324a586-01e6-4df9-84b9-cc675eac10b4	NHUỘM TÓC DÀI HAIR STYLIST	N1DS	HÓA CHẤT NỮ DÀI	\N	\N	\N	1800000	30	\N	t	f	\N	\N
f9bf02a1-e171-4c9e-9682-14a0cf13bfb7	NHUỘM TÓC DÀI HAIR STYLIST (công nghệ PH & Cortex)	NSDPH	HÓA CHẤT NỮ DÀI	\N	\N	\N	2300000	30	\N	t	f	\N	\N
2bce669c-a631-49c1-b829-aeb23b52d397	NHUỘM TÓC DÀI HAIR DESIGNER	N1DD	HÓA CHẤT NỮ DÀI	\N	\N	\N	2200000	30	\N	t	f	\N	\N
844ac0de-b027-417a-b532-740067e9c72a	NHUỘM TÓC DÀI HAIR DESIGNER (công nghệ PH & Cortex)	NDDPH	HÓA CHẤT NỮ DÀI	\N	\N	\N	2700000	30	\N	t	f	\N	\N
6616fe53-d8d0-4d1d-8172-5450dab9c4eb	NHUỘM TÓC DÀI HAIR ARTIST	N1AD	HÓA CHẤT NỮ DÀI	\N	\N	\N	2600000	30	\N	t	f	\N	\N
3380e54c-3b89-450e-96af-26d11b781bc8	NHUỘM TÓC DÀI HAIR ARTIST (công nghệ PH & Cortex)	NADPH	HÓA CHẤT NỮ DÀI	\N	\N	\N	3100000	30	\N	t	f	\N	\N
c93a370f-ceb2-4208-8af4-a7e9431f3b06	TẨY FULL NAM HAIR STYLIST ( bột tẩy )	TFSNAB	HOÁ CHẤT NAM (TẨY)	\N	\N	\N	800000	30	\N	t	f	\N	\N
271d2431-bac4-4f7a-9aa8-4724087d2f2d	TẨY FULL NAM HAIR STYLIST (kem tẩy )	TFSNAK	HOÁ CHẤT NAM (TẨY)	\N	\N	\N	1100000	30	\N	t	f	\N	\N
7137f8c2-5e81-4c3f-8c33-ac96b23395e3	TẨY FULL NAM HAIR DESIGNER( bột tẩy )	TFDNAB	HOÁ CHẤT NAM (TẨY)	\N	\N	\N	1000000	30	\N	t	f	\N	\N
eb513c25-ec78-4cf8-a4a1-a65dfd6fc815	TẨY FULL NAM HAIR DESIGNER (kem tẩy )	TFDNAK	HOÁ CHẤT NAM (TẨY)	\N	\N	\N	1300000	30	\N	t	f	\N	\N
07952404-a1cc-45e1-8143-05a4c252b6e6	TẨY FULL NAM HAIR ARTIST ( bột tẩy )	TFANAB	HOÁ CHẤT NAM (TẨY)	\N	\N	\N	1200000	30	\N	t	f	\N	\N
b8dc676b-04b0-4505-a5e2-f1a22564996c	TẨY FULL NAM HAIR ARTIST (kem tẩy )	TFANAK	HOÁ CHẤT NAM (TẨY)	\N	\N	\N	1600000	30	\N	t	f	\N	\N
4b6f09de-4b34-4d83-a248-ab28c6b91ae0	TẨY CHÂN NAM HAIR ARTIST (kem tẩy )	TCANAK	HOÁ CHẤT NAM (TẨY)	\N	\N	\N	1400000	30	\N	t	f	\N	\N
379fc2b8-70fa-4ad3-b27c-3d3bb6984dbd	TẨY CHÂN NAM HAIR ARTIST ( bột  tẩy )	TCANAB	HOÁ CHẤT NAM (TẨY)	\N	\N	\N	1100000	30	\N	t	f	\N	\N
beadeddf-613d-4172-ba37-676eb28f4eac	TẨY CHÂN NAM HAIR DESIGNER (kem tẩy )	TCDNAK	HOÁ CHẤT NAM (TẨY)	\N	\N	\N	1100000	30	\N	t	f	\N	\N
4f865d2f-137b-4e9f-ab5b-17e1341193e0	TẨY CHÂN NAM HAIR DESIGNER ( bột  tẩy )	TCDNAB	HOÁ CHẤT NAM (TẨY)	\N	\N	\N	900000	30	\N	t	f	\N	\N
e388dcf1-ce7b-4a3b-b79e-03fbda762b61	TẨY CHÂN NAM HAIR STYLIST ( bột  tẩy )	TCSNAB	HOÁ CHẤT NAM (TẨY)	\N	\N	\N	700000	30	\N	t	f	\N	\N
971d0d0b-c3b6-4ee8-8089-e425dd9e339c	TẨY CHÂN NAM HAIR STYLIST (kem tẩy )	TCSNAK	HOÁ CHẤT NAM (TẨY)	\N	\N	\N	1000000	30	\N	t	f	\N	\N
d1553731-055b-4f8b-a8c6-546006c04990	TẨY THIẾT KẾ BALAYAGE NAM HAIR STYLIST	BLSNA	HOÁ CHẤT NAM (TẨY)	\N	\N	\N	600000	30	\N	t	f	\N	\N
6231f2ca-15f6-48ee-b1ab-69f6f5413287	TẨY THIẾT KẾ BALAYAGE NAM HAIR DESIGNER	BLDNA	HOÁ CHẤT NAM (TẨY)	\N	\N	\N	800000	30	\N	t	f	\N	\N
36e7ae83-38c4-4ea5-a8ec-3824a470bd33	TẨY THIẾT KẾ BALAYAGE NAM HAIR ARTIST	BLANA	HOÁ CHẤT NAM (TẨY)	\N	\N	\N	1000000	30	\N	t	f	\N	\N
8d1e0363-e4f9-4e90-8720-77167b036cbc	TẨY THIẾT KẾ OMBRE NAM HAIR STYLIST	OMSNA	HOÁ CHẤT NAM (TẨY)	\N	\N	\N	600000	30	\N	t	f	\N	\N
f646891d-c923-4475-bc20-b50e38bbb370	TẨY THIẾT KẾ OMBRE NAM HAIR DESIGNER	OMDNA	HOÁ CHẤT NAM (TẨY)	\N	\N	\N	800000	30	\N	t	f	\N	\N
b4fa4aef-8fdd-46c4-bed4-33fb3428166e	TẨY THIẾT KẾ OMBRE NAM HAIR ARTIST	OMANA	HOÁ CHẤT NAM (TẨY)	\N	\N	\N	1000000	30	\N	t	f	\N	\N
3a6e4402-d883-4670-abf2-3adf5d4a989d	TẨY THIẾT KẾ HIGHTLIGHT NAM HAIR STYLIST	HLSNA	HOÁ CHẤT NAM (TẨY)	\N	\N	\N	600000	30	\N	t	f	\N	\N
6546d14c-c262-4472-a460-164ac33a8978	TẨY THIẾT KẾ HIGHTLIGHT NAM HAIR DESIGNER	HLDNA	HOÁ CHẤT NAM (TẨY)	\N	\N	\N	800000	30	\N	t	f	\N	\N
3175e3ac-a5c1-4789-baec-368cb757d846	TẨY THIẾT KẾ HIGHTLIGHT NAM HAIR ARTIST	HLANA	HOÁ CHẤT NAM (TẨY)	\N	\N	\N	1000000	30	\N	t	f	\N	\N
a5718880-4968-448b-81b6-5d380c87b061	NÂNG NỀN TÓC NAM HAIR STYLIST	NNSNA	HÓA CHẤT NAM	\N	\N	\N	300000	30	\N	t	f	\N	\N
edb123dd-8de9-401f-bb40-ae36a7e2c7f5	NÂNG NỀN TÓC NAM HAIR DESIGNER	NNDNA	HÓA CHẤT NAM	\N	\N	\N	350000	30	\N	t	f	\N	\N
b155edb1-ec0a-45fc-81f7-c1559d40bcd0	NÂNG NỀN TÓC NAM HAIR ARTIST	NNANA	HÓA CHẤT NAM	\N	\N	\N	450000	30	\N	t	f	\N	\N
5a577859-7f96-4874-8c1c-7336b454a19f	GLOSS YOUR HAIR NAM HAIR STYLIST	GLSNA	HÓA CHẤT NAM	\N	\N	\N	200000	30	\N	t	f	\N	\N
9245d31e-b492-4cd7-8cf3-406c4a75f443	GLOSS YOUR HAIR NAM HAIR DESIGNER	GLDNA	HÓA CHẤT NAM	\N	\N	\N	250000	30	\N	t	f	\N	\N
f8522435-e4fc-4387-8d50-a8897df9555e	GLOSS YOUR HAIR NAM HAIR ARTIST	GLANA	HÓA CHẤT NAM	\N	\N	\N	300000	30	\N	t	f	\N	\N
22ca219f-20ae-4dce-94c2-508cd784652a	UỐN TÓC TÉM HAIR STYLIST	U1ST	HÓA CHẤT NỮ TÉM	\N	\N	\N	1000000	30	\N	t	f	\N	\N
e2993a30-360c-406d-b6f3-0815ed2e961f	UỐN TÓC TÉM HAIR STYLIST ( công nghệ Aquaperm)	UST	HÓA CHẤT NỮ TÉM	\N	\N	\N	1200000	30	\N	t	f	\N	\N
6922eeb9-ef8a-4085-800e-67151dc21367	UỐN TÓC TÉM  HAIR DESIGNER	U1DT	HÓA CHẤT NỮ TÉM	\N	\N	\N	1200000	30	\N	t	f	\N	\N
b07fa3d5-a0f6-4a37-9811-be303d5e99b8	UỐN TÓC TÉM HAIR DESIGNER ( công nghệ Aquaperm)	UDT	HÓA CHẤT NỮ TÉM	\N	\N	\N	1500000	30	\N	t	f	\N	\N
fc282109-e35c-4874-ac95-ec323335773b	UỐN TÓC TÉM  HAIR ARTIST ( công nghệ Aquaperm)	UAT	HÓA CHẤT NỮ TÉM	\N	\N	\N	1800000	30	\N	t	f	\N	\N
a8ccaad9-b7db-4133-9d90-a4aefc2f155f	UỐN TÓC TÉM  HAIR ARTIST	U1AT	HÓA CHẤT NỮ TÉM	\N	\N	\N	1500000	30	\N	t	f	\N	\N
c56f89e8-0262-417f-bb96-64940a5ae96c	DUỖI TÓC TÉM HAIR ARTIST ( công nghệ Aquaperm)	DAT	HÓA CHẤT NỮ TÉM	\N	\N	\N	1800000	30	\N	t	f	\N	\N
b3ca26ac-2427-4f65-b9ae-0d14abb3b639	DUỖI TÓC TÉM HAIR ARTIST	DU1AT	HÓA CHẤT NỮ TÉM	\N	\N	\N	1500000	30	\N	t	f	\N	\N
40ae8f4b-8fda-4be2-a044-2ed931b04e32	DUỖI TÓC TÉM HAIR DESIGNER ( công nghệ Aquaperm)	DDT	HÓA CHẤT NỮ TÉM	\N	\N	\N	1500000	30	\N	t	f	\N	\N
15312460-ebe1-43f8-add1-728152a5291f	DUỖI TÓC TÉM HAIR DESIGNER	DU1DT	HÓA CHẤT NỮ TÉM	\N	\N	\N	1200000	30	\N	t	f	\N	\N
79e0fc17-f529-4cf5-844d-d916dfc1acb8	DUỖI TÓC TÉM HAIR STYLIST ( công nghệ Aquaperm)	DST	HÓA CHẤT NỮ TÉM	\N	\N	\N	1200000	30	\N	t	f	\N	\N
b4cc43ac-f429-4fe5-a6de-f1e606025ab6	DUỖI TÓC TÉM HAIR STYLIST	DU1ST	HÓA CHẤT NỮ TÉM	\N	\N	\N	1000000	30	\N	t	f	\N	\N
9ea79e7d-20e3-4e4e-be0b-2e4d5c22d927	UỐN HIPPIE TÉM HAIR STYLIST ( công nghệ Aquaperm)	HIPST	HÓA CHẤT NỮ TÉM	\N	\N	\N	1600000	30	\N	t	f	\N	\N
a32cb9cf-e05c-4194-af04-f4ef2e32b029	UỐN HIPPIE TÉM HAIR DESIGNER	HIPDT	HÓA CHẤT NỮ TÉM	\N	\N	\N	1700000	30	\N	t	f	\N	\N
d682c899-60fc-471c-85fd-2dbc691635c5	UỐN HIPPIE TÉM HAIR ARTIST ( công nghệ Aquaperm)	HIPAT	HÓA CHẤT NỮ TÉM	\N	\N	\N	2300000	30	\N	t	f	\N	\N
02793dea-3a0e-4424-bfbc-df63c821ac5f	NHUỘM THUẦN CHAY AVEDA TÉM HAIR STYLIST	NAVST	HÓA CHẤT NỮ TÉM	\N	\N	\N	1700000	30	\N	t	f	\N	\N
6c5edc4e-a5b9-4db7-8700-198877074385	NHUỘM THUẦN CHAY AVEDA TÉM HAIR DESIGNER	NAVDT	HÓA CHẤT NỮ TÉM	\N	\N	\N	2000000	30	\N	t	f	\N	\N
fc191f6c-cafb-4964-b693-acf7f0cea152	NHUỘM THUẦN CHAY AVEDA TÉM HAIR ARTIST	NAVAT	HÓA CHẤT NỮ TÉM	\N	\N	\N	2500000	30	\N	t	f	\N	\N
6be8d8bf-ff82-4a78-bc81-60418e97a5ce	NHUỘM CHÂN TÓC THUẦN CHAY AVEDA HAIR ARTIST	NCAVA	CHÂN TÓC	\N	\N	\N	1300000	30	\N	t	f	\N	\N
e78e23ae-82c5-4e22-b924-1eb9a8a06e83	NHUỘM CHÂN TÓC  HAIR DESIGNER (công nghệ PH & Cortex)	NCDPH	CHÂN TÓC	\N	\N	\N	1000000	30	\N	t	f	\N	\N
da8bf07f-2765-41fa-bfb3-20db474734cf	TẨY FULL TÉM HAIR STYLIST ( bột tẩy )	TFSTB	HÓA CHẤT NỮ TÉM ( TẨY )	\N	\N	\N	1000000	30	\N	t	f	\N	\N
ecf11a4f-1fc0-4071-b1ff-90a6dc651e5b	TẨY FULL TÉM HAIR DESIGNER ( bột tẩy )	TFDTB	HÓA CHẤT NỮ TÉM ( TẨY )	\N	\N	\N	1200000	30	\N	t	f	\N	\N
2048944b-d58d-46ea-9b9f-47eb052090d8	TẨY FULL TÉM HAIR ARTIST ( bột tẩy )	TFATB	HÓA CHẤT NỮ TÉM ( TẨY )	\N	\N	\N	1500000	30	\N	t	f	\N	\N
1d65654d-f20a-4e2b-94ca-226bdcab7863	TẨY FULL TÉM HAIR STYLIST ( kem tẩy )	TFSTK	HÓA CHẤT NỮ TÉM ( TẨY )	\N	\N	\N	1500000	30	\N	t	f	\N	\N
fcd2d534-4317-436b-8f10-7420d9ac924b	TẨY FULL TÉM HAIR DESIGNER ( kem tẩy )	TFDTK	HÓA CHẤT NỮ TÉM ( TẨY )	\N	\N	\N	1700000	30	\N	t	f	\N	\N
81cf0c3d-46f0-4dc9-823e-ab54364a745f	TẨY FULL TÉM HAIR ARTIST ( kem tẩy )	TFATK	HÓA CHẤT NỮ TÉM ( TẨY )	\N	\N	\N	2000000	30	\N	t	f	\N	\N
73be6945-2f4a-4c1a-bea8-4ca5c79cbdf9	TẨY CHÂN TÓC HAIR STYLIST ( kem tẩy )	TCSK	CHÂN TÓC	\N	\N	\N	1000000	30	\N	t	f	\N	\N
efb84ecc-e4e3-435b-b076-689709816c99	TẨY CHÂN TÓC HAIR DESIGNER ( kem tẩy )	TCDK	CHÂN TÓC	\N	\N	\N	1200000	30	\N	t	f	\N	\N
b5ae1d5b-ec30-4b4f-bef9-37f93e6fe2f0	TẨY CHÂN TÓC  HAIR ARTIST ( kem tẩy )	TCAK	CHÂN TÓC	\N	\N	\N	1400000	30	\N	t	f	\N	\N
eab651dc-c570-4344-9c63-809bb1b7005b	TẨY CHÂN TÓC HAIR STYLIST ( bột tẩy )	TCSB	CHÂN TÓC	\N	\N	\N	700000	30	\N	t	f	\N	\N
bac8dab7-dc91-495b-b094-de0447742557	TẨY CHÂN TÓC HAIR DESIGNER ( bột tẩy )	TCDB	CHÂN TÓC	\N	\N	\N	900000	30	\N	t	f	\N	\N
935579cc-3279-4bc4-8d93-aa2d102c20bf	TẨY CHÂN TÓC HAIR ARTIST ( bột tẩy )	TCAB	CHÂN TÓC	\N	\N	\N	1400000	30	\N	t	f	\N	\N
265acbe4-dfb7-4b9e-8e76-191312ec1362	TẨY THIẾT KẾ BALAYAGE`TÓC TÉM HAIR STYLIST	BLST	HÓA CHẤT NỮ TÉM ( TẨY )	\N	\N	\N	2000000	30	\N	t	f	\N	\N
4e6bf7c4-daea-4f1f-bbde-b8b25fe4b74c	TẨY THIẾT KẾ BALAYAGE TÓC TÉM HAIR DESIGNER	BLDT	HÓA CHẤT NỮ TÉM ( TẨY )	\N	\N	\N	2400000	30	\N	t	f	\N	\N
3779ce14-797f-4501-b4a8-323d5f988611	TẨY THIẾT KẾ BALAYAGE TÓC TÉM HAIR ARTIST	BLAT	HÓA CHẤT NỮ TÉM ( TẨY )	\N	\N	\N	2900000	30	\N	t	f	\N	\N
12b049d3-5357-442d-b363-4de09edeb859	TẨY THIẾT KẾ OMBRE TÓC TÉM HAIR STYLIST	OMST	HÓA CHẤT NỮ TÉM ( TẨY )	\N	\N	\N	2000000	30	\N	t	f	\N	\N
6ca10750-df07-409a-ba20-2c68d08b2af6	TẨY THIẾT KẾ OMBRE TÓC TÉM HAIR DESIGNER	OMDT	HÓA CHẤT NỮ TÉM ( TẨY )	\N	\N	\N	2400000	30	\N	t	f	\N	\N
ec1fa9bb-cdec-437a-bedb-db8a6eba116a	TẨY THIẾT KẾ OMBRE TÓC TÉM HAIR ARTIST	OMAT	HÓA CHẤT NỮ TÉM ( TẨY )	\N	\N	\N	2900000	30	\N	t	f	\N	\N
4717494b-166f-493a-87f9-993c36fb3149	TẨY THIẾT KẾ HIGHTLIGHT  TÓC TÉM HAIR STYLIST	HLST	HÓA CHẤT NỮ TÉM ( TẨY )	\N	\N	\N	2000000	30	\N	t	f	\N	\N
335e2c89-8692-40ec-a040-5d5bd7c17c7f	TẨY THIẾT KẾ HIGHTLIGHT  TÓC TÉM HAIR DESIGNER	HLDT	HÓA CHẤT NỮ TÉM ( TẨY )	\N	\N	\N	2400000	30	\N	t	f	\N	\N
a4d661a5-6290-4b4b-9898-2cc6c6b87963	TẨY THIẾT KẾ HIGHTLIGHT  TÓC TÉM HAIR ARTIST	HLAT	HÓA CHẤT NỮ TÉM ( TẨY )	\N	\N	\N	2900000	30	\N	t	f	\N	\N
6ccfb379-d080-4e34-b673-5cca57c7c312	NÂNG NỀN TÓC TÉM HAIR STYLIST	NNST	HÓA CHẤT NỮ TÉM	\N	\N	\N	600000	30	\N	t	f	\N	\N
4c670e1f-73ac-47e2-905e-88016611272a	NÂNG NỀN TÓC TÉM HAIR DESIGNER	NNDT	HÓA CHẤT NỮ TÉM	\N	\N	\N	750000	30	\N	t	f	\N	\N
11e23b8f-de4c-4917-9d43-83ce2e2c327d	NÂNG NỀN TÓC TÉM HAIR ARTIST	NNAT	HÓA CHẤT NỮ TÉM	\N	\N	\N	850000	30	\N	t	f	\N	\N
df8c595c-42a0-4c10-8906-86cf6ca98957	GLOSS YOUR HAIR TÓC TÉM HAIR STYLIST	GLST	HÓA CHẤT NỮ TÉM	\N	\N	\N	300000	30	\N	t	f	\N	\N
45fad55a-b6c7-4ade-8bbe-c1bf425c792d	GLOSS YOUR HAIR TÓC TÉM HAIR DESIGNER	GLDT	HÓA CHẤT NỮ TÉM	\N	\N	\N	350000	30	\N	t	f	\N	\N
0ceabb02-3f4a-4e3a-aef5-541479040d85	GLOSS YOUR HAIR TÓC TÉM HAIR ARTIST	GLAT	HÓA CHẤT NỮ TÉM	\N	\N	\N	450000	30	\N	t	f	\N	\N
5ff5b9e3-fa9f-4b24-9eb1-343513607596	UỐN TÓC NGẮN HAIR STYLIST	U1SNG	HÓA CHẤT NỮ NGẮN	\N	\N	\N	1200000	30	\N	t	f	\N	\N
16978337-8a82-4a5c-829e-627364b1270f	UỐN TÓC NGẮN HAIR STYLIST (công nghệ Aquaperm)	USNG	HÓA CHẤT NỮ NGẮN	\N	\N	\N	1500000	30	\N	t	f	\N	\N
45b9e579-e135-4608-9eb1-be8a635330d7	DUỖI TÓC NGẮN HAIR STYLIST	DU1SNG	HÓA CHẤT NỮ NGẮN	\N	\N	\N	1200000	30	\N	t	f	\N	\N
bf6e97b2-f64e-4d57-8c55-426d2b496bc0	DUỖI TÓC NGẮN HAIR STYLIST (công nghệ Aquaperm)	DUSNG	HÓA CHẤT NỮ NGẮN	\N	\N	\N	1500000	30	\N	t	f	\N	\N
db33e924-20db-44d3-801b-14d776fd769f	DUỖI TÓC NGẮN HAIR DESIGNER	DU1DNG	HÓA CHẤT NỮ NGẮN	\N	\N	\N	1500000	30	\N	t	f	\N	\N
046b9b75-9981-4d72-b6dc-e211f8895bb2	DUỖI TÓC NGẮN HAIR DESIGNER (công nghệ Aquaperm)	DUDNG	HÓA CHẤT NỮ NGẮN	\N	\N	\N	1800000	30	\N	t	f	\N	\N
9f76c7a4-a78b-4ee9-9e65-f900e65b456d	DUỖI TÓC NGẮN HAIR ARTIST	DU1ANG	HÓA CHẤT NỮ NGẮN	\N	\N	\N	1800000	30	\N	t	f	\N	\N
3a807d3f-22be-4106-a1e4-949ad891d36e	DUỖI TÓC NGẮN HAIR ARTIST  (công nghệ Aquaperm)	DUANG	HÓA CHẤT NỮ NGẮN	\N	\N	\N	2200000	30	\N	t	f	\N	\N
56fce898-bdcf-4c24-bec9-14a3c0b570f6	UỐN TÓC NGẮN HAIR ARTIST	U1ANG	HÓA CHẤT NỮ NGẮN	\N	\N	\N	1800000	30	\N	t	f	\N	\N
d54b8eed-0655-44d3-aadf-9758c0d1ab6f	UỐN TÓC NGẮN HAIR ARTIST  (công nghệ Aquaperm)	HIPANG	HÓA CHẤT NỮ NGẮN	\N	\N	\N	2200000	30	\N	t	f	\N	\N
d327a9ae-ad60-4c8a-90c1-95d77a3fa987	XẢ BẤM HAIR STYLIST	DV908228	XẢ BẤM	\N	\N	\N	300000	30	\N	t	f	\N	\N
ab0e5ecb-1682-4601-8052-84b5f4ffb1ee	XẢ BẤM  HAIR DESIGNER	DV908229	XẢ BẤM	\N	\N	\N	350000	30	\N	t	f	\N	\N
4a5354fa-8495-4011-b79e-f7d08bcf2508	XẢ BẤM HAIR ARTIST	DV908230	XẢ BẤM	\N	\N	\N	400000	30	\N	t	f	\N	\N
959c0f6b-87fe-423f-909a-0d5014ffa4e2	UỐN HIPPIE TÓC NGẮN HAIR STYLIST	HIPSNG	HÓA CHẤT NỮ NGẮN	\N	\N	\N	1700000	30	\N	t	f	\N	\N
d74f0f66-43c7-4450-a1ca-4d2955e900dd	UỐN HIPPIE TÓC NGẮN HAIR DESIGNER	HIPDNG	HÓA CHẤT NỮ NGẮN	\N	\N	\N	2050000	30	\N	t	f	\N	\N
1f033c0f-cbd4-41e4-aefc-d65678fdde6b	NHUỘM THUẦN CHAY AVEDA TÓC NGẮN HAIR STYLIST	NAVSNG	HÓA CHẤT NỮ NGẮN	\N	\N	\N	2200000	30	\N	t	f	\N	\N
b59f6191-7051-44dc-9c43-8cfec2027613	NHUỘM THUẦN CHAY AVEDA  TÓC NGẮN HAIR DESIGNER	NAVDNG	HÓA CHẤT NỮ NGẮN	\N	\N	\N	2600000	30	\N	t	f	\N	\N
60a56435-8927-41f8-a410-4ac796f9922c	NHUỘM THUẦN CHAY AVEDA TÓC NGẮN HAIR ARTIST	NAVANG	HÓA CHẤT NỮ NGẮN	\N	\N	\N	3200000	30	\N	t	f	\N	\N
f82207c2-b66b-41ee-be8d-62f7ca3c1c3c	NHUỘM CHÂN TÓC THUẦN CHAY AVEDA  HAIR STYLIST	NCAVS	CHÂN TÓC	\N	\N	\N	900000	30	\N	t	f	\N	\N
a62cc61e-6f6f-4326-b71c-1866415fc1de	NHUỘM CHÂN TÓC THUẦN CHAY AVEDA HAIR DESIGNER	NCAVD	CHÂN TÓC	\N	\N	\N	1100000	30	\N	t	f	\N	\N
85312762-e526-48b2-aba4-912aabcd184b	NHUỘM CHÂN TÓC HAIR DESIGNER	NC1D	CHÂN TÓC	\N	\N	\N	900000	30	\N	t	f	\N	\N
84c528b5-bbb3-4b17-be1e-8ac9275ad991	NHUỘM CHÂN TÓC  HAIR ARTIST	NC1A	CHÂN TÓC	\N	\N	\N	1100000	30	\N	t	f	\N	\N
2351024f-56d0-4dff-bf45-c4a533dc8ee4	NHUỘM CHÂN  HAIR STYLIST (công nghệ PH & Cortex)	NCSPH	CHÂN TÓC	\N	\N	\N	800000	30	\N	t	f	\N	\N
0c81f9f1-3a2c-4bcd-b3f5-1ca2799051dc	NHUỘM CHÂN TÓC HAIR ARTIST (công nghệ PH & Cortex)	NCAPH	CHÂN TÓC	\N	\N	\N	1200000	30	\N	t	f	\N	\N
37776e13-60a1-4eca-8ae1-cdfa7ac61ed6	TẨY FULL TÓC NGẮN HAIR STYLIST ( bột  tẩy )	TFSNGB	HÓA CHẤT NỮ NGẮN ( TẨY )	\N	\N	\N	1200000	30	\N	t	f	\N	\N
5f4fb8b5-80c5-4d42-b8e3-49257e1536f7	TẨY FULL TÓC NGẮN HAIR DESIGNER ( bột  tẩy )	TFDNGB	HÓA CHẤT NỮ NGẮN ( TẨY )	\N	\N	\N	1500000	30	\N	t	f	\N	\N
40a30d1a-b3a7-4c2f-aa2a-46beb47569b7	TẨY FULL TÓC NGẮN HAIR ARTIST ( bột  tẩy )	TFANGB	HÓA CHẤT NỮ NGẮN ( TẨY )	\N	\N	\N	1800000	30	\N	t	f	\N	\N
ba08d60e-260e-4ad3-acca-3806c2532d31	TẨY FULL TÓC NGẮN HAIR STYLIST (kem tẩy )	TFSNGK	HÓA CHẤT NỮ NGẮN ( TẨY )	\N	\N	\N	1700000	30	\N	t	f	\N	\N
ad50a69d-3ade-471e-a694-dbe007c266e3	TẨY FULL TÓC NGẮN HAIR ARTIST  (kem tẩy )	TFANGK	HÓA CHẤT NỮ NGẮN ( TẨY )	\N	\N	\N	2300000	30	\N	t	f	\N	\N
d41369d2-94be-44d1-828d-6d6fc94efef6	TẨY FULL TÓC NGẮN HAIR DESIGNER  (kem tẩy )	TFDNGK	HÓA CHẤT NỮ NGẮN ( TẨY )	\N	\N	\N	2000000	30	\N	t	f	\N	\N
34c1bff1-dac4-4609-b9fb-9a7ca64f1498	TẨY THIẾT KẾ BALAYAGE TÓC NGẮN HAIR STYLIST	BLSNG	HÓA CHẤT NỮ NGẮN ( TẨY )	\N	\N	\N	2300000	30	\N	t	f	\N	\N
28c46222-cd72-4770-bc16-849178cde98e	TẨY THIẾT KẾ BALAYAGE TÓC NGẮN HAIR DESIGNER	BLDNG	HÓA CHẤT NỮ NGẮN ( TẨY )	\N	\N	\N	2800000	30	\N	t	f	\N	\N
c67082e2-c11c-4821-9d78-4bf44684da3e	TẨY THIẾT KẾ BALAYAGE TÓC NGẮN HAIR ARTIST	BLANG	HÓA CHẤT NỮ NGẮN ( TẨY )	\N	\N	\N	3400000	30	\N	t	f	\N	\N
798eb943-3584-4651-aa42-36177633206c	TẨY THIẾT KẾ OMBRE TÓC NGẮN HAIR STYLIST	OMSNG	HÓA CHẤT NỮ NGẮN ( TẨY )	\N	\N	\N	2300000	30	\N	t	f	\N	\N
1ccd791f-f9d4-45da-90bb-0eee1fade66e	TẨY THIẾT KẾ OMBRE TÓC NGẮN HAIR DESIGNER	OMDNG	HÓA CHẤT NỮ NGẮN ( TẨY )	\N	\N	\N	2800000	30	\N	t	f	\N	\N
9b64a8d1-b3fc-49d3-974d-963934677071	TẨY THIẾT KẾ OMBRE TÓC NGẮN HAIR ARTIST	OMANG	HÓA CHẤT NỮ NGẮN ( TẨY )	\N	\N	\N	3400000	30	\N	t	f	\N	\N
8f8122bf-dce7-4de6-b92d-51a095dc56c4	TẨY THIẾT KẾ HIGHTLIGHT TÓC NGẮN HAIR STYLIST	HLSNG	HÓA CHẤT NỮ NGẮN ( TẨY )	\N	\N	\N	2300000	30	\N	t	f	\N	\N
4614613d-f1a2-4f0a-8628-82edeca0c8fe	TẨY THIẾT KẾ HIGHTLIGHT TÓC NGẮN HAIR DESIGNER	HLDNG	HÓA CHẤT NỮ NGẮN ( TẨY )	\N	\N	\N	2800000	30	\N	t	f	\N	\N
5ab54e40-df5a-4cc7-9391-aeb7356240f5	TẨY THIẾT KẾ HIGHTLIGHT TÓC NGẮN HAIR ARTIST	HLANG	HÓA CHẤT NỮ NGẮN ( TẨY )	\N	\N	\N	3400000	30	\N	t	f	\N	\N
4702e7e9-05cf-4b46-a403-ae4e2be43975	NÂNG NỀN TÓC NGẮN HAIR STYLIST	NNSNG	HÓA CHẤT NỮ NGẮN	\N	\N	\N	700000	30	\N	t	f	\N	\N
fda05232-9021-4848-9030-cc205bd0e952	NÂNG NỀN TÓC NGẮN HAIR ARTIST	NNANG	HÓA CHẤT NỮ NGẮN	\N	\N	\N	1100000	30	\N	t	f	\N	\N
3b52eb7a-b311-4b84-8c06-52649c19ee73	GLOSS YOUR HAIR TÓC NGẮN HAIR STYLIST	GLSNG	HÓA CHẤT NỮ NGẮN	\N	\N	\N	500000	30	\N	t	f	\N	\N
ef236ca8-1247-4b45-82a1-4108843fbdce	NÂNG NỀN TÓC NGẮN HAIR DESIGNER	NNDN	HÓA CHẤT NỮ NGẮN	\N	\N	\N	900000	30	\N	t	f	\N	\N
49a3d76c-98a7-4410-93af-5252183e360e	GLOSS YOUR HAIR TÓC NGẮN HAIR DESIGNER	GLDNG	HÓA CHẤT NỮ NGẮN	\N	\N	\N	600000	30	\N	t	f	\N	\N
ed4a9007-3f26-425a-a33e-f20458e85393	GLOSS YOUR HAIR TÓC NGẮN HAIR ARTIST	GLANG	HÓA CHẤT NỮ NGẮN	\N	\N	\N	800000	30	\N	t	f	\N	\N
7e17c487-8c58-4bfb-9425-44a262dadaca	UỐN TÓC VỪA HAIR STYLIST	U1SV	HÓA CHẤT NỮ VỪA	\N	\N	\N	1500000	30	\N	t	f	\N	\N
c9786f36-4c87-47b9-a45f-ca11b5ef6919	UỐN TÓC VỪA HAIR DESIGNER	U1DV	HÓA CHẤT NỮ VỪA	\N	\N	\N	1800000	30	\N	t	f	\N	\N
fddf4147-b7ec-46b0-b9c5-fadb350ec4bb	UỐN TÓC VỪA HAIR ARTIST	U1AV	HÓA CHẤT NỮ VỪA	\N	\N	\N	2200000	30	\N	t	f	\N	\N
2d19dcbe-40c4-4a12-878b-a683bf117ab7	DUỖI TÓC VỪA HAIR STYLIST	DU1SV	HÓA CHẤT NỮ VỪA	\N	\N	\N	1500000	30	\N	t	f	\N	\N
1582e0f2-c92f-4517-ad6f-ea1d629ed5cd	DUỖI TÓC VỪA HAIR DESIGNER	DU1DV	HÓA CHẤT NỮ VỪA	\N	\N	\N	1800000	30	\N	t	f	\N	\N
946a43f2-617e-46eb-bd3f-583a07229b57	DUỖI TÓC VỪA HAIR ARTIST	DU1AV	HÓA CHẤT NỮ VỪA	\N	\N	\N	2200000	30	\N	t	f	\N	\N
3c86fbaf-0a1d-4f15-a5e5-c81439041471	UỐN TÓC VỪA HAIR STYLIST (công nghệ Aquaperm)	USV	HÓA CHẤT NỮ VỪA	\N	\N	\N	1900000	30	\N	t	f	\N	\N
d5cc9e61-cc36-4a44-9141-ca4c0fd33e8e	UỐN TÓC VỪA HAIR DESIGNER (công nghệ Aquaperm)	UDV	HÓA CHẤT NỮ VỪA	\N	\N	\N	2300000	30	\N	t	f	\N	\N
0e60073d-778e-4c40-b264-1a30eae9101b	UỐN TÓC VỪA HAIR ARTIST  (công nghệ Aquaperm)	UAV	HÓA CHẤT NỮ VỪA	\N	\N	\N	2750000	30	\N	t	f	\N	\N
f850f90c-a790-4971-bdf4-9c99388394c8	DUỖI TÓC VỪA HAIR STYLIST (công nghệ Aquaperm)	DSV	HÓA CHẤT NỮ VỪA	\N	\N	\N	1900000	30	\N	t	f	\N	\N
191f4a92-98a1-4621-a8f0-2d9265579a02	DUỖI TÓC VỪA HAIR DESIGNER (công nghệ Aquaperm)	DDV	HÓA CHẤT NỮ VỪA	\N	\N	\N	2300000	30	\N	t	f	\N	\N
8676052f-f7d8-4b0b-a48a-229f4413f3f8	DUỖI TÓC VỪA HAIR ARTIST  (công nghệ Aquaperm)	DAV	HÓA CHẤT NỮ VỪA	\N	\N	\N	2750000	30	\N	t	f	\N	\N
b473c693-9ec6-41e2-a843-af79555b0138	UỐN HIPPIE TÓC VỪA HAIR STYLIST	HIPSV	HÓA CHẤT NỮ VỪA	\N	\N	\N	2000000	30	\N	t	f	\N	\N
a1dcb015-c300-4973-a68f-0610d7bbfc03	UỐN HIPPIE TÓC VỪA HAIR DESIGNER	HIPDV	HÓA CHẤT NỮ VỪA	\N	\N	\N	2500000	30	\N	t	f	\N	\N
8f8a1951-7eea-456f-9205-3dcfb07e33de	UỐN HIPPIE TÓC VỪA HAIR ARTIST	HIPAV	HÓA CHẤT NỮ VỪA	\N	\N	\N	3000000	30	\N	t	f	\N	\N
101f3d16-6e1e-4d81-b3c3-ba70be81e7bf	NHUỘM THUẦN CHAY AVEDA TÓC VỪA HAIR STYLIST	NAVSV	HÓA CHẤT NỮ VỪA	\N	\N	\N	2700000	30	\N	t	f	\N	\N
20d4f688-6053-4a8a-ae94-d3c16f0c7917	NHUỘM THUẦN CHAY AVEDA TÓC VỪA HAIR DESIGNER	NAVDV	HÓA CHẤT NỮ VỪA	\N	\N	\N	3200000	30	\N	t	f	\N	\N
6f80e440-0b8e-4eca-b083-15554bfef7c2	NHUỘM THUẦN CHAY AVEDA VỪA HAIR ARTIST	NAVAV	HÓA CHẤT NỮ VỪA	\N	\N	\N	3700000	30	\N	t	f	\N	\N
c3e6f213-e721-4037-8e01-3ed4b51996bd	CẮT TÓC MÁI	cat mai	CẮT TÓC THIẾT KẾ	\N	\N	\N	100000	30	\N	t	f	\N	\N
5003076c-be78-4417-a871-df00f2152dbf	NÂNG NỀN TÓC VỪA HAIR DESIGNER	NNDV	HÓA CHẤT NỮ VỪA	\N	\N	\N	950000	30	\N	t	f	\N	\N
d30f2bc6-eb6b-4cf5-930e-c6b567688012	NÂNG NỀN TÓC VỪA HAIR ARTIST	NNAV	HÓA CHẤT NỮ VỪA	\N	\N	\N	1200000	30	\N	t	f	\N	\N
dd646be7-6332-450b-b580-62a145a8cee3	GLOSS YOUR HAIR TÓC VỪA HAIR STYLIST	GLSV	HÓA CHẤT NỮ VỪA	\N	\N	\N	700000	30	\N	t	f	\N	\N
1f5c27f7-37ba-4270-a780-32d2a00faa24	GLOSS YOUR HAIR TÓC VỪA HAIR DESIGNER	GLDV	HÓA CHẤT NỮ VỪA	\N	\N	\N	850000	30	\N	t	f	\N	\N
2861859d-d8fc-4e83-9ec9-810a2ca3ecc4	GLOSS YOUR HAIR  TÓC VỪA HAIR ARTIST	GLAV	HÓA CHẤT NỮ VỪA	\N	\N	\N	1000000	30	\N	t	f	\N	\N
567f29c9-5d88-4e4e-abfd-f36120185440	TẨY THIẾT KẾ BALAYGE TÓC VỪA HAIR STYLIST	BLSV	HÓA CHẤT NỮ VỪA ( TẨY )	\N	\N	\N	2600000	30	\N	t	f	\N	\N
4322b221-71e7-40c4-9953-3da020d05cf7	TẨY THIẾT KẾ BALAYGE TÓC VỪA HAIR DESIGNER	BLDV	HÓA CHẤT NỮ VỪA ( TẨY )	\N	\N	\N	3200000	30	\N	t	f	\N	\N
bd62f40a-7c67-4efe-94c2-3c0ea2492405	TẨY THIẾT KẾ BALAYGE TÓC VỪA HAIR ARTIST	BLAV	HÓA CHẤT NỮ VỪA ( TẨY )	\N	\N	\N	3800000	30	\N	t	f	\N	\N
8f4f1e5e-8a72-4463-9121-736f8dde8118	TẨY THIẾT KẾ OMBRE TÓC VỪA HAIR STYLIST	OMSV	HÓA CHẤT NỮ VỪA ( TẨY )	\N	\N	\N	2600000	30	\N	t	f	\N	\N
9a817169-265d-464d-85c3-1afbd1c5bfb1	TẨY THIẾT KẾ OMBRE TÓC VỪA HAIR DESIGNER	OMDV	HÓA CHẤT NỮ VỪA ( TẨY )	\N	\N	\N	3200000	30	\N	t	f	\N	\N
1204ea5b-ac36-472d-91b8-96e633879238	TẨY THIẾT KẾ OMBREE TÓC VỪA HAIR ARTIST	OMAV	HÓA CHẤT NỮ VỪA ( TẨY )	\N	\N	\N	3800000	30	\N	t	f	\N	\N
5bdd9e66-8741-44c6-bf1e-2249aed32813	TẨY THIẾT KẾ HIGHTLIGHT TÓC VỪA HAIR STYLIST	HLSV	HÓA CHẤT NỮ VỪA ( TẨY )	\N	\N	\N	2600000	30	\N	t	f	\N	\N
a1d89775-398c-4ff3-a34d-d05c1adc2940	TẨY THIẾT KẾ HIGHTLIGHT TÓC VỪA HAIR DESIGNER	HLDV	HÓA CHẤT NỮ VỪA ( TẨY )	\N	\N	\N	3200000	30	\N	t	f	\N	\N
cd084392-e52a-4ebd-9846-46d5c5615c57	TẨY THIẾT KẾ HIGHTLIGHT  TÓC VỪA HAIR ARTIST	HLAV	HÓA CHẤT NỮ VỪA ( TẨY )	\N	\N	\N	3800000	30	\N	t	f	\N	\N
8dc5416c-902d-415e-8855-dcbf207ba052	TẨY FULL TÓC VỪA HAIR STYLIST ( bột  tẩy )	TFSVB	HÓA CHẤT NỮ VỪA ( TẨY )	\N	\N	\N	1500000	30	\N	t	f	\N	\N
4e4fc293-eb25-4f8c-989f-6256ca32235c	TẨY FULL TÓC VỪA HAIR DESIGNER ( bột  tẩy )	TFDVB	HÓA CHẤT NỮ VỪA ( TẨY )	\N	\N	\N	1800000	30	\N	t	f	\N	\N
bbd765b4-2ded-474e-8bb5-0f0157748b0a	TẨY FULL TÓC VỪA HAIR ARTIST ( bột  tẩy )	TFAVB	HÓA CHẤT NỮ VỪA ( TẨY )	\N	\N	\N	2200000	30	\N	t	f	\N	\N
3588bb60-2add-4a13-bc31-cdd7c3ba3fdb	TẨY FULL TÓC VỪA HAIR STYLIST (kem tẩy )	TFSVK	HÓA CHẤT NỮ VỪA ( TẨY )	\N	\N	\N	1900000	30	\N	t	f	\N	\N
2182a616-a2e6-4a3f-841d-7b9521284ab5	TẨY FULL TÓC VỪA HAIR DESIGNER (kem tẩy )	TFDVK	HÓA CHẤT NỮ VỪA ( TẨY )	\N	\N	\N	2300000	30	\N	t	f	\N	\N
504763d1-4ad8-493c-b10c-3b465d865ee5	TẨY FULL TÓC VỪA HAIR ARTIST (kem tẩy )	TFAVK	HÓA CHẤT NỮ VỪA ( TẨY )	\N	\N	\N	2700000	30	\N	t	f	\N	\N
d5fde1d6-5ef7-4a47-9ade-495b62de0626	UỐN TÓC DÀI HAIR STYLIST	U1SD	HÓA CHẤT NỮ DÀI	\N	\N	\N	1800000	30	\N	t	f	\N	\N
1b284482-3a5b-4d64-a3af-eb28efb45c3a	DUỖI TÓC DÀI HAIR STYLIST	DU1SD	HÓA CHẤT NỮ DÀI	\N	\N	\N	1800000	30	\N	t	f	\N	\N
f474c5f1-e0bc-42aa-980b-86860946c074	UỐN TÓC DÀI  HAIR STYLIST (công nghệ Aquaperm)	USD	HÓA CHẤT NỮ DÀI	\N	\N	\N	2300000	30	\N	t	f	\N	\N
bcfa4e09-0c35-448a-a5b8-d578b94540c4	DUỖI TÓC DÀI HAIR STYLIST (công nghệ Aquaperm)	DUSD	HÓA CHẤT NỮ DÀI	\N	\N	\N	2300000	30	\N	t	f	\N	\N
54b9fa6e-9b9a-47e9-9c6b-07390cf53489	UỐN TÓC DÀI HAIR DESIGNER	U1DD	HÓA CHẤT NỮ DÀI	\N	\N	\N	2200000	30	\N	t	f	\N	\N
c55621c5-8394-4b2f-afbf-5f0390123690	UỐN TÓC DÀI HAIR DESIGNER  (công nghệ Aquaperm)	UDD	HÓA CHẤT NỮ DÀI	\N	\N	\N	2800000	30	\N	t	f	\N	\N
11e28b66-d921-4955-a475-30455395e86c	DUỖI TÓC DÀI HAIR DESIGNER	DU1DD	HÓA CHẤT NỮ DÀI	\N	\N	\N	2200000	30	\N	t	f	\N	\N
8dbbdc6e-a7fd-4d87-a138-3d29d7f48a93	DUỖI TÓC DÀI HAIR DESIGNER (công nghệ Aquaperm)	DUDD	HÓA CHẤT NỮ DÀI	\N	\N	\N	2800000	30	\N	t	f	\N	\N
f1c4290b-65ee-402d-a3a6-70777d3caa04	DUỖI TÓC DÀI HAIR ARTIST	DU1AD	HÓA CHẤT NỮ DÀI	\N	\N	\N	2700000	30	\N	t	f	\N	\N
fa3429aa-4c75-4ed6-ba7d-a40bcdf3d583	DUỖI TÓC DÀI HAIR ARTIST (công nghệ Aquaperm)	DUAD	HÓA CHẤT NỮ DÀI	\N	\N	\N	3350000	30	\N	t	f	\N	\N
e833448e-5b32-4559-b61b-872fd40cc432	UỐN TÓC DÀI HAIR ARTIST	U1AD	HÓA CHẤT NỮ DÀI	\N	\N	\N	2700000	30	\N	t	f	\N	\N
2f5e8555-abeb-44c5-9527-ca7e775914cc	UỐN TÓC DÀI HAIR ARTIST  (công nghệ Aquaperm)	UAD	HÓA CHẤT NỮ DÀI	\N	\N	\N	3350000	30	\N	t	f	\N	\N
4dc2897c-7ad9-4f5c-a2d3-1c19860cbf3a	UỐN HIPPIE TÓC DÀI HAIR STYLIST (công nghệ Aquaperm)	HIPSD	HÓA CHẤT NỮ DÀI	\N	\N	\N	2800000	30	\N	t	f	\N	\N
1d38a736-b281-4d04-98c9-ec2e47698813	UỐN HIPPIE TÓC DÀI HAIR DESIGNER  (công nghệ Aquaperm)	HIPDD	HÓA CHẤT NỮ DÀI	\N	\N	\N	3400000	30	\N	t	f	\N	\N
db499b49-f44e-4eb8-ab64-c929b05d06be	UỐN HIPPIE TÓC DÀI HAIR ARTIST  (công nghệ Aquaperm)	HIPAD	HÓA CHẤT NỮ DÀI	\N	\N	\N	4000000	30	\N	t	f	\N	\N
d49ecdcd-367f-4d09-b579-070345602254	TẨY FULL TÓC DÀI HAIR STYLIST ( bột  tẩy )	TFSDB	HÓA CHẤT NỮ DÀI (TẨY)	\N	\N	\N	1800000	30	\N	t	f	\N	\N
bcf46f5c-d08a-47e0-bbf4-800f5eb8cb83	TẨY FULL TÓC DÀI HAIR DESIGNER ( bột  tẩy )	TFDDB	HÓA CHẤT NỮ DÀI (TẨY)	\N	\N	\N	2200000	30	\N	t	f	\N	\N
1c1ae48d-9075-4614-b272-d4a7e45bfba3	TẨY FULL TÓC DÀI HAIR ARTIST ( bột  tẩy )	TFADB	HÓA CHẤT NỮ DÀI (TẨY)	\N	\N	\N	2600000	30	\N	t	f	\N	\N
dc92a785-87a4-4847-9d89-b93645666ba1	TẨY FULL TÓC DÀI HAIR STYLIST (kem tẩy )	TFSDK	HÓA CHẤT NỮ DÀI (TẨY)	\N	\N	\N	2300000	30	\N	t	f	\N	\N
ab5614a5-7659-4eac-8c28-c1440e2fcca0	TẨY FULL TÓC DÀI HAIR DESIGNER (kem tẩy )	TFDDK	HÓA CHẤT NỮ DÀI (TẨY)	\N	\N	\N	2500000	30	\N	t	f	\N	\N
d872e967-cae4-48ee-95f3-ef2b7d5156f8	TẨY FULL TÓC DÀI HAIR ARTIST (kem tẩy )	TFADK	HÓA CHẤT NỮ DÀI (TẨY)	\N	\N	\N	3100000	30	\N	t	f	\N	\N
3333d44c-27e1-463e-b92e-a8ac2aa7f497	TẨY THIẾT KẾ BALAYAGE TÓC DÀI HAIR STYLIST	BLSD	HÓA CHẤT NỮ DÀI (TẨY)	\N	\N	\N	2900000	30	\N	t	f	\N	\N
442c350c-ecd4-4269-8899-0d4711e517f8	TẨY THIẾT KẾ BALAYAGE TÓC DÀI HAIR DESIGNER	BLDD	HÓA CHẤT NỮ DÀI (TẨY)	\N	\N	\N	3500000	30	\N	t	f	\N	\N
8e99a375-c216-4aa6-a36e-83209aba83e2	TẨY THIẾT KẾ BALAYAGE TÓC DÀI HAIR ARTIST	BLAD	HÓA CHẤT NỮ DÀI (TẨY)	\N	\N	\N	4200000	30	\N	t	f	\N	\N
82e9ff17-edf5-441f-8644-0c838880146c	TẨY THIẾT KẾ OMBRE TÓC DÀI HAIR STYLIST	OMSD	HÓA CHẤT NỮ DÀI (TẨY)	\N	\N	\N	2900000	30	\N	t	f	\N	\N
50871bf5-edd6-401f-9527-f35935c9fe8b	TẨY THIẾT KẾ OMBRE TÓC DÀI HAIR DESIGNER	OMDD	HÓA CHẤT NỮ DÀI (TẨY)	\N	\N	\N	3500000	30	\N	t	f	\N	\N
6179350c-8254-4a05-9bf5-c2e1a0d13f03	TẨY THIẾT KẾ OMBRE TÓC DÀI HAIR ARTIST	OMAD	HÓA CHẤT NỮ DÀI (TẨY)	\N	\N	\N	4200000	30	\N	t	f	\N	\N
bb7d4274-38ee-4808-be53-c364eb96619a	TẨY THIẾT KẾ HIGHTLIGHT TÓC DÀI HAIR STYLIST	HLSD	HÓA CHẤT NỮ DÀI (TẨY)	\N	\N	\N	2900000	30	\N	t	f	\N	\N
50e92de6-a7f8-4040-b097-b97c5f896bd1	TẨY THIẾT KẾ HIGHTLIGHT TÓC DÀI HAIR DESIGNER	HLDD	HÓA CHẤT NỮ DÀI (TẨY)	\N	\N	\N	3500000	30	\N	t	f	\N	\N
67eee1ee-8cc4-4557-998e-aaacd7d4aedc	TẨY THIẾT KẾ HIGHTLIGHTTÓC DÀI HAIR ARTIST	HLAD	HÓA CHẤT NỮ DÀI (TẨY)	\N	\N	\N	4200000	30	\N	t	f	\N	\N
a19c2731-2b48-4b08-884a-0e8db00eda41	NÂNG NỀN TÓC DÀI HAIR STYLIST	NNSD	HÓA CHẤT NỮ DÀI	\N	\N	\N	900000	30	\N	t	f	\N	\N
fae3a6a5-e2fa-4e57-a338-b99be8986003	NÂNG NỀN TÓC DÀI HAIR DESIGNER	NNDD	HÓA CHẤT NỮ DÀI	\N	\N	\N	1100000	30	\N	t	f	\N	\N
354fede7-061d-4010-864c-d4f20b0e92c3	NÂNG NỀN TÓC DÀI HAIR ARTIST	NNAD	HÓA CHẤT NỮ DÀI	\N	\N	\N	1300000	30	\N	t	f	\N	\N
b8bae546-4985-4f8a-a6b6-ee77a1848b59	GLOSS YOUR HAIR TÓC DÀI HAIR STYLIST	GLSD	HÓA CHẤT NỮ DÀI	\N	\N	\N	900000	30	\N	t	f	\N	\N
134c0a7f-0fbb-4491-9760-cd833b2c830f	GLOSS YOUR HAIR TÓC DÀI HAIR DESIGNER	GLDD	HÓA CHẤT NỮ DÀI	\N	\N	\N	1100000	30	\N	t	f	\N	\N
826a868a-ed39-47f7-8a07-e35caf10bd84	GLOSS YOUR HAIR  TÓC DÀI HAIR ARTIST	GLAD	HÓA CHẤT NỮ DÀI	\N	\N	\N	1300000	30	\N	t	f	\N	\N
67b6e762-b22c-4408-9f9a-72b26344cf59	PROFESSION OIL DERMALOGICA TAY	DV908523	RELAX	\N	\N	\N	150000	30	\N	t	f	\N	\N
e3886b6d-1114-4d4f-8cbe-1a2cb064ae88	PROFESSION OIL DERMALOGICA BODY	DV908524	RELAX	\N	\N	\N	250000	30	\N	t	f	\N	\N
c656be65-27bb-438e-9755-091f3166ea6a	PROFESSION OIL CLARINS TAY	DV908525	RELAX	\N	\N	\N	150000	30	\N	t	f	\N	\N
2399b194-3a36-4b86-9d54-529963f18b81	PROFESSION OIL CLARINS BODY	DV908526	RELAX	\N	\N	\N	250000	30	\N	t	f	\N	\N
7c03ef4c-cda8-4405-8c32-e5dc543a726c	PROFESSION OIL COMFORT ZONE FOOT	DV908529	RELAX	\N	\N	\N	150000	30	\N	t	f	\N	\N
16177c9a-f586-40e7-bc8b-6b9588047225	PROFESSION OIL COMFORT ZONE TAY	DV908530	RELAX	\N	\N	\N	150000	30	\N	t	f	\N	\N
6bff053e-8faf-4b80-93d5-80c55bb8ae48	PROFESSION OIL COMFORT ZONE BODY	DV908531	RELAX	\N	\N	\N	250000	30	\N	t	f	\N	\N
9a3bee27-52da-472a-90d6-fdcb24676001	RELAX  CỔ - VAI - GÁY 60P	V60	RELAX	\N	\N	\N	420000	30	\N	t	f	\N	\N
f95d035e-3b74-4b8d-b040-ff77b9162613	RELAX  CỔ - VAI - GÁY 90P	V90	RELAX	\N	\N	\N	600000	30	\N	t	f	\N	\N
c1b84bee-1df3-4b82-86de-275e1d6a4bc6	RELAX  CỔ - VAI - GÁY 120P	V120	RELAX	\N	\N	\N	800000	30	\N	t	f	\N	\N
7e8ea9fc-a97e-4e40-b79e-22b0e95f2435	RELAX TAY 60P	T60	RELAX	\N	\N	\N	220000	30	\N	t	f	\N	\N
ac7f9a5a-ae31-4b44-9044-e86496612831	RELAX TAY 90P	T90	RELAX	\N	\N	\N	320000	30	\N	t	f	\N	\N
0e9e03d3-991f-45b4-9495-1c1d6084127c	RELAX TAY 120P	T120	RELAX	\N	\N	\N	450000	30	\N	t	f	\N	\N
25af32a3-4a23-4088-a8ae-ef65d2baa8fa	THÁO GEL ÚP	DV908563	NAIL	\N	\N	\N	160000	30	\N	t	f	\N	\N
d2e72352-efd1-48e4-b8fa-dd680d77d93c	SƠN DƯỠNG CỨNG MÓNG	CỨNG	NAIL	\N	\N	\N	80000	30	\N	t	f	\N	\N
0ce5cfee-01bc-424d-8f8b-8d850ca3e422	UỐN TÓC NGẮN HAIR DESIGNER	U1DNG	HÓA CHẤT NỮ NGẮN	\N	\N	\N	1500000	30	\N	t	f	\N	\N
89a3f289-106f-439f-975a-e829561a0358	UỐN TÓC NGẮN HAIR DESIGNER (công nghệ Aquaperm)	UDNG	HÓA CHẤT NỮ NGẮN	\N	\N	\N	1800000	30	\N	t	f	\N	\N
6c85d356-3642-4938-87e7-2262014903d2	NHUỘM THUẦN CHAY AVEDA TÓC DÀI HAIR STYLIST	NAVSD	HÓA CHẤT NỮ DÀI	\N	\N	\N	3400000	30	\N	t	f	\N	\N
df1c99da-afc6-4ce7-8b72-04b2411e5cb4	NHUỘM THUẦN CHAY AVEDA TÓC DÀI HAIR DESIGNER	NAVDD	HÓA CHẤT NỮ DÀI	\N	\N	\N	3800000	30	\N	t	f	\N	\N
71834cbe-46a7-4011-8d7d-00ddf4b2a993	NHUỘM THUẦN CHAY AVEDA TÓC DÀI HAIR ARTIST	NAVAD	HÓA CHẤT NỮ DÀI	\N	\N	\N	4100000	30	\N	t	f	\N	\N
81e07966-d031-49f0-b9cb-e54e7a10e781	NHUỘM CHÂN TÓC HAIR STYLIST	DV908757	CHÂN TÓC	\N	\N	\N	700000	30	\N	t	f	\N	\N
b09d69ad-2bd3-4988-9492-0fad7336360a	NHUỘM CHÂN TÓC HAIR STYLIST (công nghệ PH & Cortex)	DV908758	CHÂN TÓC	\N	\N	\N	800000	30	\N	t	f	\N	\N
250643d1-8c3b-477b-82f8-8bf440ec924a	BAO DƯỠNG KERATIN	BDK	NAIL	\N	\N	\N	160000	30	\N	t	f	\N	\N
bda9f96a-e46a-4e86-b1d3-5710bb7564e6	DEFY DAMAGE PRO SERIES 1+2 FULL NAM	DDPFNA	ADVANCED HAIR RESTORATION VÀ TREATMENT	\N	\N	\N	700000	30	\N	t	f	\N	\N
3aecd476-2777-4855-b3e0-18ce4a06f6f8	DEFY DAMAGE PRO SERIES 1+2 FULL NỮ LONG	DDPFN	ADVANCED HAIR RESTORATION VÀ TREATMENT	\N	\N	\N	1500000	30	\N	t	f	\N	\N
da970e7b-25a2-441f-9763-8d5e9877e01e	SƠN FLASH	DV909206	NAIL	\N	\N	\N	230000	30	\N	t	f	\N	\N
4a451a94-acb0-4ea9-a3a3-474316ab6cc1	NÂNG MỐI NỐI CHUN	DV909251	NỐI TÓC CHUN	\N	\N	\N	0	30	\N	t	f	\N	\N
9892d79d-4bab-4934-be7f-9ffa1428bcfb	THÁO MỐI NỐI CHUN	DV909252	NỐI TÓC CHUN	\N	\N	\N	0	30	\N	t	f	\N	\N
b6cc6b15-6af9-48a7-8841-fa68df5cc56e	OIL DẦU DỪA	DV909390	RELAX	\N	\N	\N	50000	30	\N	t	f	\N	\N
6a674e88-0f88-40e7-8011-0a5fde02a8f2	AVEDA 5 NỮ SHORT 40P	a5nu	COMBO AVEDA	\N	\N	\N	2540000	30	\N	t	f	\N	\N
525f487a-a2d4-4aa9-af3f-d0ac7bf7a734	AVEDA 5 NAM 40P	a5na	COMBO AVEDA	\N	\N	\N	1950000	30	\N	t	f	\N	\N
fd31f4f7-7efa-4bc0-92f3-5dea7c134d95	SƠN THƯỜNG	DV910209	NAIL	\N	\N	\N	80000	30	\N	t	f	\N	\N
77797cc5-0fc0-42ef-8ba0-73d2a6495f00	GỘI THƯ GIÃN NAM CS 40P BS ÁNH SẮC	gcsna	GỘI VÀ THƯ GIÃN	null	\N	\N	300000	30	\N	t	f	\N	\N
a1401936-c215-48ce-a1c0-25ee5372d880	GỘI THƯ GIÃN NỮ DÀI CS 40P BS ÁNH SẮC	gcsnu	GỘI VÀ THƯ GIÃN	\N	\N	\N	400000	30	\N	t	f	\N	\N
93266b9a-d2a9-4f4a-9dc4-a181f967ac13	GỘI THƯ GIÃN NAM CS 60P BS ÁNH SẮC	gcs60na	GỘI VÀ THƯ GIÃN	\N	\N	\N	420000	30	\N	t	f	\N	\N
2661311c-1656-4a7e-866d-7305815c3b7b	MẶT NẠ DA DẦU AVEDA	DV910623	NUÔI DƯỠNG DA ĐẦU	\N	\N	\N	500000	30	\N	t	f	\N	\N
30ecb01c-d203-4657-9f75-2149e7ef83c9	MM THẢI ĐỘC DA HÀN	DV910625	FACIAL	\N	\N	\N	60000	30	\N	t	f	\N	\N
d2655226-537e-40cd-a9f3-71fcdbe5e5a1	AVEDA 5 NỮ LONG 40P	A5D40	COMBO AVEDA	\N	\N	\N	2800000	30	\N	t	f	\N	\N
24d24955-a484-4923-a68f-534f5b222c81	AVEDA 5 NAM 60P	DV911001	COMBO AVEDA	\N	\N	\N	2070000	30	\N	t	f	\N	\N
8bb4111c-2176-45b7-bcc8-863e5dc5c6d5	AVEDA 5 NỮ LONG 60P	DV911002	COMBO AVEDA	\N	\N	\N	2920000	30	\N	t	f	\N	\N
d6599dfb-5895-4538-9f9c-7d853365428d	AVEDA 5 NỮ SHORT 60P	DV911003	COMBO AVEDA	\N	\N	\N	2660000	30	\N	t	f	\N	\N
38248ded-8d9d-4eb9-aed3-80ea8415904d	AVEDA 6 NAM 60P	DV911007	COMBO AVEDA	\N	\N	\N	2470000	30	\N	t	f	\N	\N
23790279-5fab-4971-a0ce-63c2e7851b49	AVEDA 6 NAM 40P	DV911008	COMBO AVEDA	\N	\N	\N	2350000	30	\N	t	f	\N	\N
de07be0d-42c1-47f7-899d-69cbed444d3c	AVEDA 6 NỮ LONG 40P	DV911011	COMBO AVEDA	\N	\N	\N	3200000	30	\N	t	f	\N	\N
d015db8c-4c02-484d-b69b-2a70213d180c	AVEDA 6 NỮ LONG 60P	DV911012	COMBO AVEDA	\N	\N	\N	3320000	30	\N	t	f	\N	\N
18adb833-7f13-471b-91df-79852a38f4cb	AVEDA 6  NỮ SHORT 40P	DV911013	COMBO AVEDA	\N	\N	\N	2940000	30	\N	t	f	\N	\N
56789e8a-fd3a-4036-bb4d-e5b92c4824cc	AVEDA 6 NỮ SHORT 60P	DV911015	COMBO AVEDA	\N	\N	\N	3060000	30	\N	t	f	\N	\N
06fd07d9-ad4c-46f1-a521-a625f9d54eb8	GỘI THƯ GIÃN NỮ NGẮN CC 40P	gccnu	GỘI VÀ THƯ GIÃN	\N	\N	\N	540000	30	\N	t	f	\N	\N
3f60852c-51bd-4171-92bb-c211560acafe	GỘI THƯ GIÃN NỮ NGẮN CC 60P	gcc60nu	GỘI VÀ THƯ GIÃN	\N	\N	\N	660000	30	\N	t	f	\N	\N
e41082bb-29eb-4a86-b307-b66285a5baa0	AMINO AXIT FULL NỮ SHORT	DV911163	ADVANCED HAIR RESTORATION VÀ TREATMENT	\N	\N	\N	1000000	30	\N	t	f	\N	\N
a7da275c-ca2d-48c4-9b09-cd0896c5a091	BỔ SUNG 20 PROTEIN NỮ NGẮN	DV911164	ADVANCED HAIR RESTORATION VÀ TREATMENT	\N	\N	\N	500000	30	\N	t	f	\N	\N
da91ab4e-9e13-4192-b7ce-9df490ef68c9	DEFY DAMAGE PRO SERIES 1+2 FULL NỮ SHORT	DV911165	ADVANCED HAIR RESTORATION VÀ TREATMENT	\N	\N	\N	1300000	30	\N	t	f	\N	\N
d73deef4-6d1a-40df-9c43-008228c03782	Ủ KERATIN NỮ NGẮN	UKNU	ADVANCED HAIR RESTORATION VÀ TREATMENT	\N	\N	\N	1000000	30	\N	t	f	\N	\N
bdd0fb74-7547-47e6-9702-58f9767e0888	AMINO AXIT  NGỌN  NỮ	DV911171	ADVANCED HAIR RESTORATION VÀ TREATMENT	\N	\N	\N	300000	30	\N	t	f	\N	\N
a3ccf52b-b7cf-4084-8175-46b0fe1f792b	XẢ TÓC	xả	GỘI VÀ THƯ GIÃN	\N	\N	\N	50000	30	\N	t	f	\N	\N
1318b662-2efa-40cd-834a-6bbefc68894f	COMBO KERASTASE TÓC DÀI 40P	DV920376	COMBO KERASTAE	\N	\N	\N	1800000	30	\N	t	f	\N	\N
f7e3b980-c3d6-45dc-8179-7e844775abfe	COMBO KERASATE NỮ NGẮN 40P	DV921142	COMBO KERASTAE	\N	\N	\N	1640000	30	\N	t	f	\N	\N
f5cef8b7-3474-4793-ae64-e5963aa2bbc4	COMBO KERASTASE TÓC NAM 40P	DV921143	COMBO KERASTAE	\N	\N	\N	1400000	30	\N	t	f	\N	\N
bde02791-aed4-437c-a80e-49a70dc695bb	COMBO KERASTASE TÓC DÀI 60P	DV921146	COMBO KERASTAE	\N	\N	\N	1920000	30	\N	t	f	\N	\N
c020141c-2964-4ea5-959d-1cf64f07ff86	COMBO KERASTASE NAM 60P	DV921147	COMBO KERASTAE	\N	\N	\N	1520000	30	\N	t	f	\N	\N
4a90bae5-9a03-4b67-95bd-e804da82e1eb	COMBO KERASTASE NGẮN 60P	DV921148	COMBO KERASTAE	\N	\N	\N	1760000	30	\N	t	f	\N	\N
f17f2f3d-5ba9-43b0-bc3b-5ea8875c0e48	Bh Uốn/Duỗi	DV924640	HÓA CHẤT NỮ NGẮN	\N	\N	\N	0	30	\N	t	f	\N	\N
68d780f8-9d04-4960-9072-88c9a539b576	DV AMPOULE BẢO VỆ DA ĐẦU 15ML (xanh)	DV930948	Dịch Vụ AMPOULE	\N	\N	\N	250000	30	\N	t	f	\N	\N
026e8cb0-413b-45ee-9998-f25526c140b7	DV AMPOULE BẢO VỆ SỢI TÓC 15ml (hồng)	DV930949	Dịch Vụ AMPOULE	null	\N	\N	250000	30	\N	t	f	\N	\N
15cbafed-adcf-4616-ac2a-0ed36565201d	CẠO MẶT	DV20615	FACIAL	\N	\N	\N	50000	30	\N	t	f	\N	\N
ab164729-6214-4aa9-954c-d2a68dda18a1	MẶT NẠ MÔI	DV20616	FACIAL	\N	\N	\N	100000	30	\N	t	f	\N	\N
e936dd99-9fa7-40b6-aa53-fbe2855b2381	MN TBG HÀN SIÊU DƯỠNG ẨM TỪ DỪA	MND	FACIAL	\N	\N	\N	250000	30	\N	t	f	\N	\N
9a246454-eb98-4794-b17f-3c212b05a558	MN COLLAGEN LỘT	DV20618	FACIAL	\N	\N	\N	250000	30	\N	t	f	\N	\N
914044e7-6c96-4f5a-bd52-f623ea2db086	MN PHỤC HỒI MADECASSOSIDE	DV20619	FACIAL	\N	\N	\N	150000	30	\N	t	f	\N	\N
4cd56bfe-a219-4518-8f14-c81aaf2db870	MN THẠCH VITA C	DV20620	FACIAL	\N	\N	\N	150000	30	\N	t	f	\N	\N
f62f4dce-eb76-4b80-b654-c5ddd0e1a984	BÓC MÀU TÓC NỮ	BMNU	HÓA CHẤT NỮ DÀI (TẨY)	\N	\N	\N	1000000	30	\N	t	f	\N	\N
3fb2c488-5df9-4d5a-8b52-c22ec0d7458b	BÓC MÀU TÓC NAM	BMNA	HOÁ CHẤT NAM (TẨY)	\N	\N	\N	800000	30	\N	t	f	\N	\N
f12c7414-d2d7-4465-9580-193bb601f5a9	DƯỠNG GUERLAIN	DGL	MASK VÀ TREATMENT	\N	\N	\N	150000	30	\N	t	f	\N	\N
76fd7286-e869-433c-948f-9ec533af4c3d	DƯỠNG GUERLAIN TÓC DÀI	DGLD	MASK VÀ TREATMENT	\N	\N	\N	250000	30	\N	t	f	\N	\N
4bc091cf-b22a-42ba-b571-e823f6674b47	GỘI DETOX	GDT	GỘI VÀ THƯ GIÃN	\N	\N	\N	250000	30	\N	t	f	\N	\N
3707ece3-660f-4287-9eca-fc873e6457c2	BẢO HÀNH CẮT	DV944713	CẮT TÓC THIẾT KẾ	\N	\N	\N	0	30	\N	t	f	\N	\N
11348d3e-0976-4c6a-8e56-73a83edd2812	Phủ Bóng	Phu bong	HÓA CHẤT NỮ DÀI	\N	\N	\N	2600000	30	\N	t	f	\N	\N
2c27d432-bded-4f83-93a4-79b917fa7991	MAKEUP & BÚI TÓC ĐI TIỆC	MAKEUP&BUITOCTIEC	MAKEUP & BỚI TÓC	\N	\N	\N	2000000	30	\N	t	f	\N	\N
75b795d1-d979-401e-8bee-de0e4b4044ce	BÚI TÓC TIỆC/ EVENT	BUITOC	MAKEUP & BỚI TÓC	\N	\N	\N	800000	30	\N	t	f	\N	\N
6d467760-7cdf-4e40-8b5f-484fdc29d5c1	MAKEUP & BÚI TÓC CÔ DÂU	MAKEUP&BUITOCDAU	MAKEUP & BỚI TÓC	\N	\N	\N	5000000	30	\N	t	f	\N	\N
\.


--
-- Data for Name: ServiceCost; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."ServiceCost" (id, "serviceId", "visitId", "invoiceId", "productId", "quantityUsed", "unitPrice", "totalCost", "servicePrice", margin, "createdAt") FROM stdin;
\.


--
-- Data for Name: ServiceProductUsage; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."ServiceProductUsage" (id, "serviceId", "productId", amount) FROM stdin;
\.


--
-- Data for Name: ServiceSOP; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."ServiceSOP" (id, "serviceId", "serviceName", steps, "standardParams", prerequisites, materials, "qualityStandards", version, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SimulationSession; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."SimulationSession" (id, "userId", scenario, persona, messages, score, feedback, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SkillAssessment; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."SkillAssessment" (id, "staffId", source, "sourceId", "scenarioType", communication, technical, "problemSolving", "customerExperience", upsale, "totalScore", level, strengths, improvements, "detailedFeedback", "weaknessAnalysis", recommendations, "assessedBy", "createdAt", "updatedAt", "branchId") FROM stdin;
\.


--
-- Data for Name: SkillProgress; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."SkillProgress" (id, "userId", skill, score, source, "refId", "createdAt") FROM stdin;
\.


--
-- Data for Name: SmartDiscount; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."SmartDiscount" (id, "discountType", "discountName", "discountValue", "discountUnit", "minPurchase", "serviceIds", "branchIds", "customerSegments", "startTime", "endTime", "isActive", conditions, "usageCount", "maxUsage", "revenueImpact", "aiGenerated", "aiReasoning", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Staff; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Staff" (id, "userId", "employeeId", "position", "hireDate", salary, "commissionRate", specialization, "isActive", "createdAt", "updatedAt") FROM stdin;
80658c41-7f5f-437b-8d6f-92721b12982a	314c73da-e9ab-4885-ac7e-036ad347bdde	NV0001	\N	\N	\N	\N	\N	t	2025-12-12 11:28:58.763	2025-12-12 11:28:58.763
\.


--
-- Data for Name: StaffDailyRecord; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."StaffDailyRecord" (id, "staffId", date, "checkIn", "checkOut", status, notes) FROM stdin;
\.


--
-- Data for Name: StaffSalaryProfile; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."StaffSalaryProfile" (id, "staffId", "baseSalary", "commissionConfig", "kpiTargets", penalties, "updatedAt") FROM stdin;
\.


--
-- Data for Name: StaffService; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."StaffService" (id, "staffId", "serviceId") FROM stdin;
\.


--
-- Data for Name: StaffShift; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."StaffShift" (id, "staffId", date, "startTime", "endTime", notes) FROM stdin;
\.


--
-- Data for Name: StockIssue; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."StockIssue" (id, "issueNumber", "branchId", reason, "staffId", date, status, "totalAmount", "createdBy", "approvedBy", "approvedAt", notes, "createdAt", "updatedAt", "recipientId", "recipientName") FROM stdin;
\.


--
-- Data for Name: StockIssueItem; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."StockIssueItem" (id, "issueId", "productId", quantity, "unitPrice", "totalPrice", notes) FROM stdin;
\.


--
-- Data for Name: StockLog; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."StockLog" (id, "productId", type, quantity, "pricePerUnit", "totalCost", note, "referenceId", "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: StockReceipt; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."StockReceipt" (id, "receiptNumber", "branchId", "supplierId", date, status, "totalAmount", "createdBy", "approvedBy", "approvedAt", notes, "createdAt", "updatedAt", "discountPercent", "finalAmount", "importType", "totalDiscount") FROM stdin;
0a1bb87b-82de-4531-9635-51fc069b344e	PN-2025-12-0001	cmj0bs16u00001atx0vzfjs5n	35d7b984-1574-44bf-8415-ccabea3463c8	2025-12-12 02:28:00	COMPLETED	0	f4620314-2df1-4c53-8262-c8b459f21d8b	\N	\N	\N	2025-12-12 09:28:30.61	2025-12-12 09:28:30.61	\N	0	NHAP_MUA_TU_NCC	0
\.


--
-- Data for Name: StockReceiptItem; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."StockReceiptItem" (id, "receiptId", "productId", quantity, "unitPrice", "totalPrice", notes, "discountAmount", "discountPercent") FROM stdin;
170111e0-6f26-4034-b73b-f2a4fdb8c30e	0a1bb87b-82de-4531-9635-51fc069b344e	ae494727-767f-4046-8c6e-45c8a0acfc1d	2	0	0	\N	\N	\N
\.


--
-- Data for Name: StockTransaction; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."StockTransaction" (id, "productId", "branchId", type, quantity, reason, "createdAt", "referenceId") FROM stdin;
e1eb7ed5-a9a1-4dbe-91f2-a75ba1c139a6	97fac3e6-a165-4c5d-bc7c-f01d8c18a01a	cmj0bs16u00001atx0vzfjs5n	OUT	194	Nhập hàng	2025-11-14 18:10:58.199	\N
5d937bca-ee12-4a73-9348-7622aa42a65f	97fac3e6-a165-4c5d-bc7c-f01d8c18a01a	cmj0bs16u00001atx0vzfjs5n	OUT	170	Xuất kho	2025-12-10 18:10:58.201	\N
5dc849d5-e78d-4dfc-9af1-164e7a144b03	97fac3e6-a165-4c5d-bc7c-f01d8c18a01a	cmj0bs16u00001atx0vzfjs5n	IN	293	Pha chế	2025-12-03 18:10:58.202	\N
b638efa2-33a8-44cf-b2f6-d8dfd012e00f	97fac3e6-a165-4c5d-bc7c-f01d8c18a01a	cmj0bs16u00001atx0vzfjs5n	ADJUST	48	Nhập hàng	2025-11-28 18:10:58.203	\N
844e2f51-7ad8-4270-a9a5-d775973087b2	7b2beb94-6012-4ec2-98ad-84930564e2c7	cmj0bs16u00001atx0vzfjs5n	IN	167	Pha chế	2025-11-29 18:10:58.207	\N
265ed5c1-9f42-42c6-862c-1224c09fee46	7b2beb94-6012-4ec2-98ad-84930564e2c7	cmj0bs16u00001atx0vzfjs5n	OUT	164	Xuất kho	2025-11-28 18:10:58.207	\N
733c0a2c-d425-4c68-baf8-56af1b02f194	7b2beb94-6012-4ec2-98ad-84930564e2c7	cmj0bs16u00001atx0vzfjs5n	OUT	195	Nhập hàng	2025-11-28 18:10:58.208	\N
c70073fa-4924-4d76-b354-831f7aae0c68	d26f25c7-7aa5-435a-9f0b-9b36da83a407	cmj0bs16u00001atx0vzfjs5n	OUT	220	Nhập hàng	2025-11-22 18:10:58.209	\N
2a907532-130f-4e8a-ad4f-0cfcb8527fcf	d26f25c7-7aa5-435a-9f0b-9b36da83a407	cmj0bs16u00001atx0vzfjs5n	OUT	192	Điều chỉnh	2025-11-26 18:10:58.21	\N
05aca7cd-d26b-4954-9a27-7b5388b21a63	d26f25c7-7aa5-435a-9f0b-9b36da83a407	cmj0bs16u00001atx0vzfjs5n	IN	167	Điều chỉnh	2025-11-19 18:10:58.21	\N
54cfcc85-180b-4e59-8a82-a79cd6f1cca5	d26f25c7-7aa5-435a-9f0b-9b36da83a407	cmj0bs16u00001atx0vzfjs5n	OUT	104	Sử dụng dịch vụ	2025-11-28 18:10:58.211	\N
666df471-1923-4633-a422-7fd4073dea4c	d26f25c7-7aa5-435a-9f0b-9b36da83a407	cmj0bs16u00001atx0vzfjs5n	ADJUST	-8	Pha chế	2025-11-13 18:10:58.211	\N
a2f4a21b-b86e-4800-b0c9-a93cb8a1a040	086d1d26-d9ac-4a13-a027-abe4b5ee420b	cmj0bs16u00001atx0vzfjs5n	ADJUST	44	Điều chỉnh	2025-12-08 18:10:58.213	\N
741125a7-d968-4bfd-9670-c097ec43060f	086d1d26-d9ac-4a13-a027-abe4b5ee420b	cmj0bs16u00001atx0vzfjs5n	OUT	92	Sử dụng dịch vụ	2025-11-22 18:10:58.214	\N
0204a706-e3fa-4fdf-9336-828a1dfc59b9	086d1d26-d9ac-4a13-a027-abe4b5ee420b	cmj0bs16u00001atx0vzfjs5n	IN	246	Nhập hàng	2025-11-16 18:10:58.214	\N
bbe97425-4c46-4052-a391-74c97ae67ee0	086d1d26-d9ac-4a13-a027-abe4b5ee420b	cmj0bs16u00001atx0vzfjs5n	IN	488	Sử dụng dịch vụ	2025-11-12 18:10:58.215	\N
8b3ba785-6929-4814-8264-d5e8b0370778	374a5e37-ef5a-4983-a690-0eb40ce26bed	cmj0bs16u00001atx0vzfjs5n	ADJUST	43	Điều chỉnh	2025-11-24 18:10:58.217	\N
b0ecac34-28c7-43c2-8d0e-4451cd191ac0	374a5e37-ef5a-4983-a690-0eb40ce26bed	cmj0bs16u00001atx0vzfjs5n	OUT	53	Xuất kho	2025-11-20 18:10:58.217	\N
c3162ec1-2623-4416-9f86-877cb1fb1774	374a5e37-ef5a-4983-a690-0eb40ce26bed	cmj0bs16u00001atx0vzfjs5n	OUT	134	Pha chế	2025-11-24 18:10:58.218	\N
ed3e9a9d-e890-4db7-914c-987a543f1a7d	3111bcec-d911-4cfd-a6f7-4b5fcb8f9bf0	cmj0bs16u00001atx0vzfjs5n	ADJUST	16	Sử dụng dịch vụ	2025-12-02 18:10:58.22	\N
58f5cb27-dfbd-42db-9941-f4536d7bc31c	3111bcec-d911-4cfd-a6f7-4b5fcb8f9bf0	cmj0bs16u00001atx0vzfjs5n	ADJUST	5	Xuất kho	2025-12-07 18:10:58.22	\N
d08cf585-55cc-4ee9-bee0-e3f6aedde2b1	3111bcec-d911-4cfd-a6f7-4b5fcb8f9bf0	cmj0bs16u00001atx0vzfjs5n	OUT	133	Nhập hàng	2025-11-17 18:10:58.221	\N
e41d3bb7-8722-4609-b90a-66370d48dce4	3111bcec-d911-4cfd-a6f7-4b5fcb8f9bf0	cmj0bs16u00001atx0vzfjs5n	IN	530	Nhập hàng	2025-11-25 18:10:58.221	\N
b5fbd4ec-4bb0-4b0a-a113-74f1427bbbf2	3111bcec-d911-4cfd-a6f7-4b5fcb8f9bf0	cmj0bs16u00001atx0vzfjs5n	ADJUST	33	Điều chỉnh	2025-12-08 18:10:58.221	\N
d2516f26-449b-4003-aa45-027f20e25d5e	f4262979-add4-4de6-b11e-ed79da03cd43	cmj0bs16u00001atx0vzfjs5n	ADJUST	37	Điều chỉnh	2025-12-05 18:10:58.223	\N
ecc03809-ffbc-4016-93f3-01e029bd7655	f4262979-add4-4de6-b11e-ed79da03cd43	cmj0bs16u00001atx0vzfjs5n	ADJUST	-5	Pha chế	2025-11-25 18:10:58.224	\N
55fc5eed-4abf-4710-8be8-b45c13b87b40	f4262979-add4-4de6-b11e-ed79da03cd43	cmj0bs16u00001atx0vzfjs5n	ADJUST	47	Sử dụng dịch vụ	2025-11-30 18:10:58.224	\N
64208fb4-fc3b-4ba3-a7ad-9d590d7ef741	f4262979-add4-4de6-b11e-ed79da03cd43	cmj0bs16u00001atx0vzfjs5n	IN	167	Sử dụng dịch vụ	2025-12-04 18:10:58.224	\N
c3174f43-af79-4df7-a325-b0d4dc918a8a	95a46917-ffe2-48ce-81c7-70965ef1af39	cmj0bs16u00001atx0vzfjs5n	OUT	180	Điều chỉnh	2025-11-17 18:10:58.226	\N
6729aee2-6b00-4d37-8e4c-f84b99e6f482	95a46917-ffe2-48ce-81c7-70965ef1af39	cmj0bs16u00001atx0vzfjs5n	IN	597	Sử dụng dịch vụ	2025-11-30 18:10:58.226	\N
55ee0c22-c074-401b-abf8-d7a2f041e805	95a46917-ffe2-48ce-81c7-70965ef1af39	cmj0bs16u00001atx0vzfjs5n	ADJUST	-50	Nhập hàng	2025-12-06 18:10:58.227	\N
7f00bf7e-e412-40be-b766-a055a4536d02	95a46917-ffe2-48ce-81c7-70965ef1af39	cmj0bs16u00001atx0vzfjs5n	ADJUST	-22	Xuất kho	2025-12-03 18:10:58.227	\N
cb57b93d-af33-4de3-971f-f793409b5384	95a46917-ffe2-48ce-81c7-70965ef1af39	cmj0bs16u00001atx0vzfjs5n	IN	575	Pha chế	2025-11-18 18:10:58.227	\N
20ed80af-e8d3-41d3-a7aa-0711aa7909dc	5a82e509-d4bc-46ab-bf32-1dced713f545	cmj0bs16u00001atx0vzfjs5n	IN	584	Pha chế	2025-11-23 18:10:58.229	\N
0b445925-dbe6-4d32-911b-a2bdd1422340	5a82e509-d4bc-46ab-bf32-1dced713f545	cmj0bs16u00001atx0vzfjs5n	IN	499	Sử dụng dịch vụ	2025-12-10 18:10:58.229	\N
eeb8bd8e-8209-4f31-8be2-ca2ce5695185	5a82e509-d4bc-46ab-bf32-1dced713f545	cmj0bs16u00001atx0vzfjs5n	OUT	228	Xuất kho	2025-12-10 18:10:58.23	\N
500b4ffe-de29-4908-b926-19375f0f048f	5a82e509-d4bc-46ab-bf32-1dced713f545	cmj0bs16u00001atx0vzfjs5n	ADJUST	5	Điều chỉnh	2025-12-07 18:10:58.23	\N
bcabad11-0168-43fb-a898-bf0eb531b71e	38634b2c-71cd-4b7a-afc4-1c79b5b8aa5e	cmj0bs16u00001atx0vzfjs5n	IN	569	Điều chỉnh	2025-11-28 18:10:58.232	\N
6bca690b-e487-4380-a6e9-f43d837f0412	38634b2c-71cd-4b7a-afc4-1c79b5b8aa5e	cmj0bs16u00001atx0vzfjs5n	OUT	229	Pha chế	2025-11-13 18:10:58.232	\N
21db87fa-3c12-4b38-8e2d-edd8b7c00cc9	38634b2c-71cd-4b7a-afc4-1c79b5b8aa5e	cmj0bs16u00001atx0vzfjs5n	OUT	198	Điều chỉnh	2025-11-12 18:10:58.233	\N
74420250-cd4c-4fe0-9849-58841b36586e	38634b2c-71cd-4b7a-afc4-1c79b5b8aa5e	cmj0bs16u00001atx0vzfjs5n	ADJUST	-25	Điều chỉnh	2025-11-21 18:10:58.233	\N
fd61e9fe-ca07-4a09-878f-0e516a7f5b1c	38634b2c-71cd-4b7a-afc4-1c79b5b8aa5e	cmj0bs16u00001atx0vzfjs5n	OUT	151	Điều chỉnh	2025-11-12 18:10:58.233	\N
a76b030b-9610-405b-8b0c-ef3740393d9b	ed72b327-13fa-4902-a5d9-90a24639b1a7	cmj0bs16u00001atx0vzfjs5n	ADJUST	-27	Điều chỉnh	2025-11-15 18:10:58.235	\N
661715a4-6c88-4910-9ebe-8f49b1d71914	ed72b327-13fa-4902-a5d9-90a24639b1a7	cmj0bs16u00001atx0vzfjs5n	IN	468	Pha chế	2025-12-05 18:10:58.236	\N
c699fdb3-22bb-4781-b59a-0cac6a1ebc7f	ed72b327-13fa-4902-a5d9-90a24639b1a7	cmj0bs16u00001atx0vzfjs5n	ADJUST	30	Pha chế	2025-11-20 18:10:58.236	\N
5f19f976-d7ac-44b6-b32c-62a4ce5058ea	3823207f-9f25-4e97-af86-75fa0460f889	cmj0bs16u00001atx0vzfjs5n	IN	543	Điều chỉnh	2025-12-10 18:10:58.238	\N
4ee58ca1-8fcd-48fb-9b0e-0b53649dfaa9	3823207f-9f25-4e97-af86-75fa0460f889	cmj0bs16u00001atx0vzfjs5n	ADJUST	31	Điều chỉnh	2025-11-24 18:10:58.238	\N
d3380c14-8483-46c6-a09c-41aec9c4226f	3823207f-9f25-4e97-af86-75fa0460f889	cmj0bs16u00001atx0vzfjs5n	OUT	218	Sử dụng dịch vụ	2025-12-03 18:10:58.238	\N
03619f5f-f438-42c9-8904-89b219c05798	3823207f-9f25-4e97-af86-75fa0460f889	cmj0bs16u00001atx0vzfjs5n	OUT	131	Điều chỉnh	2025-12-09 18:10:58.239	\N
a1d40579-86f0-46c0-8546-08f7f955883f	e28eb638-ab36-432c-ab4d-0f1e0dae4539	cmj0bs16u00001atx0vzfjs5n	IN	476	Điều chỉnh	2025-11-12 18:10:58.24	\N
75dd30ce-c885-4429-9c74-d2010564a29a	e28eb638-ab36-432c-ab4d-0f1e0dae4539	cmj0bs16u00001atx0vzfjs5n	ADJUST	18	Pha chế	2025-11-24 18:10:58.242	\N
5914107c-961a-4077-a75c-c6811d726ea8	e28eb638-ab36-432c-ab4d-0f1e0dae4539	cmj0bs16u00001atx0vzfjs5n	OUT	124	Nhập hàng	2025-12-07 18:10:58.242	\N
ed78b28b-366b-43db-82e5-623540fe2268	e28eb638-ab36-432c-ab4d-0f1e0dae4539	cmj0bs16u00001atx0vzfjs5n	ADJUST	35	Xuất kho	2025-12-09 18:10:58.242	\N
7ee0a42d-1b42-483c-9fce-ce83b0f7f16a	0d660156-03d5-42a5-83f8-846850e96fbd	cmj0bs16u00001atx0vzfjs5n	OUT	217	Xuất kho	2025-11-27 18:10:58.244	\N
bf220f90-72db-451a-bbd1-0c6a88a72999	0d660156-03d5-42a5-83f8-846850e96fbd	cmj0bs16u00001atx0vzfjs5n	ADJUST	-46	Nhập hàng	2025-11-24 18:10:58.244	\N
f3b3e145-26db-4ac4-b947-626310682351	0d660156-03d5-42a5-83f8-846850e96fbd	cmj0bs16u00001atx0vzfjs5n	IN	342	Pha chế	2025-12-04 18:10:58.245	\N
af8714ff-31a3-4642-a0ac-2ecf0dea8e56	0d660156-03d5-42a5-83f8-846850e96fbd	cmj0bs16u00001atx0vzfjs5n	OUT	174	Sử dụng dịch vụ	2025-12-01 18:10:58.245	\N
340547aa-27d6-4fb3-80fc-1228bfab10ba	0dc5eeae-9aa6-4392-8caf-b7a1bf5d86a7	cmj0bs16u00001atx0vzfjs5n	OUT	227	Xuất kho	2025-11-18 18:10:58.246	\N
47e727d5-03b0-4385-ad65-d82b4aca0cdf	0dc5eeae-9aa6-4392-8caf-b7a1bf5d86a7	cmj0bs16u00001atx0vzfjs5n	OUT	96	Nhập hàng	2025-12-10 18:10:58.247	\N
0b0a41b3-aa3b-43a1-a77e-4d5dc2f51011	0dc5eeae-9aa6-4392-8caf-b7a1bf5d86a7	cmj0bs16u00001atx0vzfjs5n	OUT	136	Pha chế	2025-11-27 18:10:58.247	\N
b477479c-6f92-4332-baa6-03217ab06573	0dc5eeae-9aa6-4392-8caf-b7a1bf5d86a7	cmj0bs16u00001atx0vzfjs5n	IN	540	Pha chế	2025-11-13 18:10:58.247	\N
4044a43c-457e-49b9-9a94-3bdcf25eb5a9	722231cf-5e67-409b-af6c-3a1dcdf0783d	cmj0bs16u00001atx0vzfjs5n	OUT	113	Pha chế	2025-12-04 18:10:58.249	\N
ed12a08d-a6e5-4845-ab6c-7416f1ee71f9	722231cf-5e67-409b-af6c-3a1dcdf0783d	cmj0bs16u00001atx0vzfjs5n	IN	325	Nhập hàng	2025-11-24 18:10:58.249	\N
e3b928dd-2894-4c5d-9329-3219be930339	722231cf-5e67-409b-af6c-3a1dcdf0783d	cmj0bs16u00001atx0vzfjs5n	OUT	63	Điều chỉnh	2025-12-10 18:10:58.25	\N
3e6ca3cc-8b76-433d-bc96-995888bed6c0	722231cf-5e67-409b-af6c-3a1dcdf0783d	cmj0bs16u00001atx0vzfjs5n	IN	264	Pha chế	2025-11-18 18:10:58.25	\N
877c0c06-78fe-45fd-b1df-d5ad30381785	97fac3e6-a165-4c5d-bc7c-f01d8c18a01a	cmj0bs16u00001atx0vzfjs5n	ADJUST	10	Pha chế	2025-11-13 18:11:16.936	\N
73716c96-50b9-43e7-8cb3-573e3345a44e	97fac3e6-a165-4c5d-bc7c-f01d8c18a01a	cmj0bs16u00001atx0vzfjs5n	OUT	188	Điều chỉnh	2025-11-19 18:11:16.938	\N
01403e23-2cbd-4ae3-b05b-9e05fba89b0f	97fac3e6-a165-4c5d-bc7c-f01d8c18a01a	cmj0bs16u00001atx0vzfjs5n	OUT	235	Nhập hàng	2025-11-21 18:11:16.938	\N
0123fd5d-2ce4-403c-838b-e6e1c34913ad	97fac3e6-a165-4c5d-bc7c-f01d8c18a01a	cmj0bs16u00001atx0vzfjs5n	OUT	238	Xuất kho	2025-11-12 18:11:16.939	\N
b27c6470-9555-4d86-9da0-05efeba12187	7b2beb94-6012-4ec2-98ad-84930564e2c7	cmj0bs16u00001atx0vzfjs5n	IN	125	Điều chỉnh	2025-12-03 18:11:16.942	\N
2cf4d722-f7d1-415e-a4b5-f3bb2f4f54bc	7b2beb94-6012-4ec2-98ad-84930564e2c7	cmj0bs16u00001atx0vzfjs5n	ADJUST	-36	Xuất kho	2025-12-06 18:11:16.942	\N
e2bd8d03-471f-4968-adfd-1b66694b4624	7b2beb94-6012-4ec2-98ad-84930564e2c7	cmj0bs16u00001atx0vzfjs5n	OUT	206	Điều chỉnh	2025-11-19 18:11:16.943	\N
750790f4-28f2-4aa3-a140-42494318c2d4	d26f25c7-7aa5-435a-9f0b-9b36da83a407	cmj0bs16u00001atx0vzfjs5n	OUT	223	Nhập hàng	2025-11-20 18:11:16.945	\N
533b0e74-3e7c-4118-936e-01e0f520003d	d26f25c7-7aa5-435a-9f0b-9b36da83a407	cmj0bs16u00001atx0vzfjs5n	ADJUST	42	Pha chế	2025-11-27 18:11:16.946	\N
c6211003-7635-4fab-bfc5-2a902aeccae8	d26f25c7-7aa5-435a-9f0b-9b36da83a407	cmj0bs16u00001atx0vzfjs5n	OUT	125	Xuất kho	2025-11-30 18:11:16.946	\N
bb074e23-a9c3-4769-b7c7-e06a106c697b	d26f25c7-7aa5-435a-9f0b-9b36da83a407	cmj0bs16u00001atx0vzfjs5n	OUT	193	Pha chế	2025-11-30 18:11:16.947	\N
9a81dc4f-cc6b-4fb5-ad34-1219a4a8c20e	d26f25c7-7aa5-435a-9f0b-9b36da83a407	cmj0bs16u00001atx0vzfjs5n	OUT	96	Sử dụng dịch vụ	2025-11-28 18:11:16.947	\N
1f4e3885-58d8-4b29-81dd-fa15b3c8fe10	086d1d26-d9ac-4a13-a027-abe4b5ee420b	cmj0bs16u00001atx0vzfjs5n	ADJUST	9	Pha chế	2025-11-12 18:11:16.95	\N
f73e6c70-204a-4664-a8e0-b61b6b05a91e	086d1d26-d9ac-4a13-a027-abe4b5ee420b	cmj0bs16u00001atx0vzfjs5n	OUT	179	Điều chỉnh	2025-11-28 18:11:16.95	\N
21d2c05d-ed49-4dae-9b3d-f654073bf6d0	086d1d26-d9ac-4a13-a027-abe4b5ee420b	cmj0bs16u00001atx0vzfjs5n	ADJUST	24	Pha chế	2025-11-12 18:11:16.951	\N
f8f0926c-7786-4701-946c-83e77c2eaf10	086d1d26-d9ac-4a13-a027-abe4b5ee420b	cmj0bs16u00001atx0vzfjs5n	ADJUST	-45	Pha chế	2025-11-23 18:11:16.951	\N
84a1715f-e173-4c4e-b8bf-84a70743c1e8	374a5e37-ef5a-4983-a690-0eb40ce26bed	cmj0bs16u00001atx0vzfjs5n	ADJUST	-32	Điều chỉnh	2025-11-29 18:11:16.953	\N
068fc716-82bc-4cd4-b2c4-b21f9c7f9b57	374a5e37-ef5a-4983-a690-0eb40ce26bed	cmj0bs16u00001atx0vzfjs5n	ADJUST	-50	Xuất kho	2025-11-23 18:11:16.954	\N
9ff8e882-8083-41fc-ab58-68820452e71e	374a5e37-ef5a-4983-a690-0eb40ce26bed	cmj0bs16u00001atx0vzfjs5n	IN	303	Điều chỉnh	2025-11-21 18:11:16.954	\N
57e29574-ced3-48dd-a9f4-ab8f44531104	374a5e37-ef5a-4983-a690-0eb40ce26bed	cmj0bs16u00001atx0vzfjs5n	IN	402	Pha chế	2025-11-23 18:11:16.955	\N
5a65df77-4d8a-4960-bf2b-bc0c08f4f81b	374a5e37-ef5a-4983-a690-0eb40ce26bed	cmj0bs16u00001atx0vzfjs5n	OUT	224	Pha chế	2025-11-21 18:11:16.955	\N
7d813c24-a6aa-4bf3-80a7-6e61cb0f778b	3111bcec-d911-4cfd-a6f7-4b5fcb8f9bf0	cmj0bs16u00001atx0vzfjs5n	OUT	93	Sử dụng dịch vụ	2025-11-25 18:11:16.958	\N
b8e294df-fe63-4158-858b-f433099bd7d5	3111bcec-d911-4cfd-a6f7-4b5fcb8f9bf0	cmj0bs16u00001atx0vzfjs5n	OUT	138	Sử dụng dịch vụ	2025-11-27 18:11:16.958	\N
cd755e3b-366a-44a7-aa62-ee153efaeb2c	3111bcec-d911-4cfd-a6f7-4b5fcb8f9bf0	cmj0bs16u00001atx0vzfjs5n	IN	560	Pha chế	2025-11-26 18:11:16.959	\N
06470c9e-d557-4ef5-883e-474fed851387	3111bcec-d911-4cfd-a6f7-4b5fcb8f9bf0	cmj0bs16u00001atx0vzfjs5n	ADJUST	-11	Xuất kho	2025-11-30 18:11:16.959	\N
aaf83101-e05f-42d2-a436-91f003c24de5	f4262979-add4-4de6-b11e-ed79da03cd43	cmj0bs16u00001atx0vzfjs5n	IN	244	Điều chỉnh	2025-12-06 18:11:16.962	\N
41b07b2e-c467-463d-923d-afca8d69e2db	f4262979-add4-4de6-b11e-ed79da03cd43	cmj0bs16u00001atx0vzfjs5n	OUT	90	Pha chế	2025-11-16 18:11:16.962	\N
2e91cf76-4bf6-490d-8b87-f2db1a981b78	f4262979-add4-4de6-b11e-ed79da03cd43	cmj0bs16u00001atx0vzfjs5n	IN	357	Pha chế	2025-11-18 18:11:16.963	\N
3ed552b1-e9fc-41df-bfdf-dd54daed5794	f4262979-add4-4de6-b11e-ed79da03cd43	cmj0bs16u00001atx0vzfjs5n	IN	446	Sử dụng dịch vụ	2025-11-20 18:11:16.963	\N
919deaff-3f9c-4af0-80f4-fa43717f7610	f4262979-add4-4de6-b11e-ed79da03cd43	cmj0bs16u00001atx0vzfjs5n	OUT	171	Điều chỉnh	2025-12-09 18:11:16.963	\N
1ec44497-f09b-4eb1-93f5-61449bace153	95a46917-ffe2-48ce-81c7-70965ef1af39	cmj0bs16u00001atx0vzfjs5n	OUT	237	Điều chỉnh	2025-12-09 18:11:16.966	\N
004c950f-5776-4c67-903d-0b51890a3db1	95a46917-ffe2-48ce-81c7-70965ef1af39	cmj0bs16u00001atx0vzfjs5n	IN	384	Pha chế	2025-11-18 18:11:16.966	\N
8704c5b6-feb2-4f1e-acd4-08c50c2cf1b7	95a46917-ffe2-48ce-81c7-70965ef1af39	cmj0bs16u00001atx0vzfjs5n	IN	599	Nhập hàng	2025-12-06 18:11:16.967	\N
d8c99398-e233-4539-8d60-3aa804fd7bf3	95a46917-ffe2-48ce-81c7-70965ef1af39	cmj0bs16u00001atx0vzfjs5n	IN	110	Điều chỉnh	2025-12-09 18:11:16.967	\N
dd97cca4-26db-408e-9346-8aa62dcb7ab5	5a82e509-d4bc-46ab-bf32-1dced713f545	cmj0bs16u00001atx0vzfjs5n	OUT	102	Xuất kho	2025-11-26 18:11:16.969	\N
127d536b-6878-4057-97ed-53f0315d80cc	5a82e509-d4bc-46ab-bf32-1dced713f545	cmj0bs16u00001atx0vzfjs5n	IN	364	Xuất kho	2025-11-22 18:11:16.97	\N
60984768-5f6a-46e0-8d5b-591e5bdff1e6	5a82e509-d4bc-46ab-bf32-1dced713f545	cmj0bs16u00001atx0vzfjs5n	IN	142	Sử dụng dịch vụ	2025-11-30 18:11:16.97	\N
2170c825-4c8b-4d93-9855-38d185af7493	5a82e509-d4bc-46ab-bf32-1dced713f545	cmj0bs16u00001atx0vzfjs5n	ADJUST	45	Điều chỉnh	2025-11-29 18:11:16.971	\N
80023583-c436-4f03-921f-def2e515d6d8	5a82e509-d4bc-46ab-bf32-1dced713f545	cmj0bs16u00001atx0vzfjs5n	OUT	61	Xuất kho	2025-12-05 18:11:16.971	\N
90ad38a4-0697-484d-850c-5c0372def117	38634b2c-71cd-4b7a-afc4-1c79b5b8aa5e	cmj0bs16u00001atx0vzfjs5n	ADJUST	-29	Điều chỉnh	2025-12-09 18:11:16.973	\N
2a506568-54d9-4ebb-be4a-a037e9fe2d42	38634b2c-71cd-4b7a-afc4-1c79b5b8aa5e	cmj0bs16u00001atx0vzfjs5n	ADJUST	-5	Sử dụng dịch vụ	2025-12-05 18:11:16.974	\N
2a24eb82-4ff6-4819-bc72-e30ced0c6794	38634b2c-71cd-4b7a-afc4-1c79b5b8aa5e	cmj0bs16u00001atx0vzfjs5n	IN	384	Pha chế	2025-11-30 18:11:16.974	\N
0f1a2ef1-a4c9-4e6b-9583-8303846ec695	38634b2c-71cd-4b7a-afc4-1c79b5b8aa5e	cmj0bs16u00001atx0vzfjs5n	IN	429	Pha chế	2025-11-25 18:11:16.975	\N
053883b8-6781-466b-ac9d-8c890f6d9b82	ed72b327-13fa-4902-a5d9-90a24639b1a7	cmj0bs16u00001atx0vzfjs5n	ADJUST	-4	Pha chế	2025-11-28 18:11:16.977	\N
87a0329e-5d74-4a30-bf36-642c1f90db10	ed72b327-13fa-4902-a5d9-90a24639b1a7	cmj0bs16u00001atx0vzfjs5n	OUT	193	Điều chỉnh	2025-12-10 18:11:16.978	\N
b0731068-fcb2-4869-8fc7-9e61309e9b14	ed72b327-13fa-4902-a5d9-90a24639b1a7	cmj0bs16u00001atx0vzfjs5n	OUT	192	Điều chỉnh	2025-11-23 18:11:16.978	\N
3ad79a57-9f6e-47b5-b679-ff317959fec1	ed72b327-13fa-4902-a5d9-90a24639b1a7	cmj0bs16u00001atx0vzfjs5n	OUT	112	Điều chỉnh	2025-11-11 18:11:16.979	\N
5602e04d-2f94-4a5b-8c1c-9389ac0345ba	3823207f-9f25-4e97-af86-75fa0460f889	cmj0bs16u00001atx0vzfjs5n	OUT	71	Sử dụng dịch vụ	2025-11-17 18:11:16.98	\N
1fe0289c-51d7-489f-8c58-623b59004234	3823207f-9f25-4e97-af86-75fa0460f889	cmj0bs16u00001atx0vzfjs5n	ADJUST	40	Nhập hàng	2025-11-26 18:11:16.981	\N
66b411b5-fc1a-4fb3-a857-2593b7d96895	3823207f-9f25-4e97-af86-75fa0460f889	cmj0bs16u00001atx0vzfjs5n	IN	174	Nhập hàng	2025-11-26 18:11:16.981	\N
fa66f76c-06ec-407e-bf85-146deec9c48a	3823207f-9f25-4e97-af86-75fa0460f889	cmj0bs16u00001atx0vzfjs5n	ADJUST	-14	Điều chỉnh	2025-11-17 18:11:16.982	\N
434ca76f-fbc2-441e-8ff2-012c2477d5ac	e28eb638-ab36-432c-ab4d-0f1e0dae4539	cmj0bs16u00001atx0vzfjs5n	ADJUST	32	Nhập hàng	2025-11-20 18:11:16.984	\N
935f03fd-9fba-40b4-9add-bc075379649a	e28eb638-ab36-432c-ab4d-0f1e0dae4539	cmj0bs16u00001atx0vzfjs5n	OUT	95	Điều chỉnh	2025-11-24 18:11:16.985	\N
c872df23-d8d9-48dc-93a3-b10272368a82	e28eb638-ab36-432c-ab4d-0f1e0dae4539	cmj0bs16u00001atx0vzfjs5n	OUT	183	Xuất kho	2025-11-15 18:11:16.985	\N
19a2e853-57df-4e7b-980c-aabbedaec7d3	0d660156-03d5-42a5-83f8-846850e96fbd	cmj0bs16u00001atx0vzfjs5n	ADJUST	43	Nhập hàng	2025-11-16 18:11:16.987	\N
adff6a36-1794-4e72-b7e4-b4468fc4ed01	0d660156-03d5-42a5-83f8-846850e96fbd	cmj0bs16u00001atx0vzfjs5n	IN	280	Điều chỉnh	2025-11-17 18:11:16.988	\N
80a3676c-e31d-4e42-8763-47fc1ef08eb9	0d660156-03d5-42a5-83f8-846850e96fbd	cmj0bs16u00001atx0vzfjs5n	OUT	94	Pha chế	2025-11-12 18:11:16.988	\N
fe414c8e-ac3d-4232-84fb-e1659dbdaaac	0d660156-03d5-42a5-83f8-846850e96fbd	cmj0bs16u00001atx0vzfjs5n	ADJUST	-46	Nhập hàng	2025-12-05 18:11:16.989	\N
2b1a7649-4d7b-4227-9d85-17650ff609fa	0dc5eeae-9aa6-4392-8caf-b7a1bf5d86a7	cmj0bs16u00001atx0vzfjs5n	ADJUST	35	Sử dụng dịch vụ	2025-12-08 18:11:16.991	\N
f5f98c68-2fad-4fd6-b3a4-005eaa63c1d2	0dc5eeae-9aa6-4392-8caf-b7a1bf5d86a7	cmj0bs16u00001atx0vzfjs5n	ADJUST	16	Sử dụng dịch vụ	2025-11-30 18:11:16.991	\N
f3d200de-1821-401e-b40d-7d9b668c7efc	0dc5eeae-9aa6-4392-8caf-b7a1bf5d86a7	cmj0bs16u00001atx0vzfjs5n	OUT	58	Pha chế	2025-11-11 18:11:16.992	\N
56b7437b-ceba-4d25-bcc8-4a6b5772f971	0dc5eeae-9aa6-4392-8caf-b7a1bf5d86a7	cmj0bs16u00001atx0vzfjs5n	OUT	207	Điều chỉnh	2025-11-11 18:11:16.992	\N
3aea05fb-d955-4d7d-85e6-1196ca92a470	0dc5eeae-9aa6-4392-8caf-b7a1bf5d86a7	cmj0bs16u00001atx0vzfjs5n	IN	116	Xuất kho	2025-11-25 18:11:16.993	\N
22261960-4ee0-4cf4-8494-2691b157388a	722231cf-5e67-409b-af6c-3a1dcdf0783d	cmj0bs16u00001atx0vzfjs5n	OUT	177	Pha chế	2025-11-27 18:11:16.995	\N
52bd7883-382c-404f-af74-3dc3f0829a90	722231cf-5e67-409b-af6c-3a1dcdf0783d	cmj0bs16u00001atx0vzfjs5n	IN	166	Sử dụng dịch vụ	2025-11-17 18:11:16.995	\N
3506b54a-48f9-4c1a-992e-c9e41a661296	722231cf-5e67-409b-af6c-3a1dcdf0783d	cmj0bs16u00001atx0vzfjs5n	ADJUST	20	Pha chế	2025-11-20 18:11:16.995	\N
73585332-ccd3-445c-821c-8caaa19e8871	97fac3e6-a165-4c5d-bc7c-f01d8c18a01a	cmj0bs16u00001atx0vzfjs5n	ADJUST	1	Sử dụng dịch vụ	2025-12-10 06:17:05.185	\N
9bea5b27-33b5-459f-bfd9-9111e22385bc	97fac3e6-a165-4c5d-bc7c-f01d8c18a01a	cmj0bs16u00001atx0vzfjs5n	OUT	154	Xuất kho	2025-12-06 06:17:05.187	\N
6c455353-70a1-41e3-9f3a-027a41f6b477	97fac3e6-a165-4c5d-bc7c-f01d8c18a01a	cmj0bs16u00001atx0vzfjs5n	OUT	59	Pha chế	2025-12-06 06:17:05.188	\N
70c75636-595b-4fde-b878-76063b5fe75e	7b2beb94-6012-4ec2-98ad-84930564e2c7	cmj0bs16u00001atx0vzfjs5n	IN	388	Điều chỉnh	2025-11-29 06:17:05.191	\N
991ac6a7-f636-4497-8f74-7503ad1b72d9	7b2beb94-6012-4ec2-98ad-84930564e2c7	cmj0bs16u00001atx0vzfjs5n	OUT	102	Điều chỉnh	2025-11-19 06:17:05.191	\N
49a082bd-6307-45dc-a276-e6ef24012970	7b2beb94-6012-4ec2-98ad-84930564e2c7	cmj0bs16u00001atx0vzfjs5n	ADJUST	10	Pha chế	2025-11-26 06:17:05.192	\N
9d449e5b-5d8c-4e8c-9ba4-fdcd95bd1df4	7b2beb94-6012-4ec2-98ad-84930564e2c7	cmj0bs16u00001atx0vzfjs5n	OUT	110	Pha chế	2025-11-15 06:17:05.193	\N
48e44bc5-9207-40c5-8281-22e7be8aa584	d26f25c7-7aa5-435a-9f0b-9b36da83a407	cmj0bs16u00001atx0vzfjs5n	ADJUST	-22	Nhập hàng	2025-11-21 06:17:05.195	\N
ed60d47e-804b-4506-b7cc-d560a3300e2a	d26f25c7-7aa5-435a-9f0b-9b36da83a407	cmj0bs16u00001atx0vzfjs5n	IN	513	Nhập hàng	2025-11-22 06:17:05.195	\N
8dc8af04-86f6-4da5-b93d-1535524ada55	d26f25c7-7aa5-435a-9f0b-9b36da83a407	cmj0bs16u00001atx0vzfjs5n	ADJUST	34	Sử dụng dịch vụ	2025-11-14 06:17:05.196	\N
ac68beb5-b73e-4ed3-b376-597f9401f784	d26f25c7-7aa5-435a-9f0b-9b36da83a407	cmj0bs16u00001atx0vzfjs5n	OUT	80	Nhập hàng	2025-12-08 06:17:05.196	\N
795cd609-43d8-404f-8354-b46bfdc4e8f4	086d1d26-d9ac-4a13-a027-abe4b5ee420b	cmj0bs16u00001atx0vzfjs5n	OUT	72	Pha chế	2025-12-04 06:17:05.199	\N
f2cb4cf3-7523-4067-8943-4e85cf115405	086d1d26-d9ac-4a13-a027-abe4b5ee420b	cmj0bs16u00001atx0vzfjs5n	IN	267	Xuất kho	2025-11-30 06:17:05.2	\N
9a5d568d-4e43-47ae-990d-60c52245fb76	086d1d26-d9ac-4a13-a027-abe4b5ee420b	cmj0bs16u00001atx0vzfjs5n	ADJUST	-11	Sử dụng dịch vụ	2025-11-20 06:17:05.2	\N
28612d72-ca36-41d9-a6e1-df8140c928a4	374a5e37-ef5a-4983-a690-0eb40ce26bed	cmj0bs16u00001atx0vzfjs5n	ADJUST	-24	Sử dụng dịch vụ	2025-11-14 06:17:05.202	\N
37dbc97f-059c-45c5-b1f4-2bc038c1d9f7	374a5e37-ef5a-4983-a690-0eb40ce26bed	cmj0bs16u00001atx0vzfjs5n	ADJUST	-4	Sử dụng dịch vụ	2025-11-23 06:17:05.202	\N
cfdc9116-d69d-462d-9364-1e76a970c6e6	374a5e37-ef5a-4983-a690-0eb40ce26bed	cmj0bs16u00001atx0vzfjs5n	IN	153	Sử dụng dịch vụ	2025-12-07 06:17:05.203	\N
66f01e43-8c7e-40be-bef5-cdde7f9e9015	374a5e37-ef5a-4983-a690-0eb40ce26bed	cmj0bs16u00001atx0vzfjs5n	ADJUST	-20	Pha chế	2025-12-02 06:17:05.203	\N
07425928-d809-4162-985c-be10c194fd28	3111bcec-d911-4cfd-a6f7-4b5fcb8f9bf0	cmj0bs16u00001atx0vzfjs5n	ADJUST	47	Sử dụng dịch vụ	2025-11-30 06:17:05.206	\N
65935be5-27b9-4292-8f54-cfc4a6d8b1dd	3111bcec-d911-4cfd-a6f7-4b5fcb8f9bf0	cmj0bs16u00001atx0vzfjs5n	OUT	178	Điều chỉnh	2025-11-21 06:17:05.207	\N
e75b0e2d-7c16-4656-9c65-b3e74dbb8be1	3111bcec-d911-4cfd-a6f7-4b5fcb8f9bf0	cmj0bs16u00001atx0vzfjs5n	OUT	183	Xuất kho	2025-12-08 06:17:05.208	\N
57408b8b-8958-4f8c-9cf4-6723e34ac343	3111bcec-d911-4cfd-a6f7-4b5fcb8f9bf0	cmj0bs16u00001atx0vzfjs5n	OUT	175	Pha chế	2025-11-25 06:17:05.208	\N
a9e188b9-0279-419f-87d0-8455d1ad9696	f4262979-add4-4de6-b11e-ed79da03cd43	cmj0bs16u00001atx0vzfjs5n	IN	297	Sử dụng dịch vụ	2025-12-09 06:17:05.211	\N
5b8164b9-486a-4581-8166-d3a2f57cb88f	f4262979-add4-4de6-b11e-ed79da03cd43	cmj0bs16u00001atx0vzfjs5n	OUT	72	Nhập hàng	2025-11-25 06:17:05.211	\N
dbc57405-26ee-45fb-a2c8-8d91c0e9d484	f4262979-add4-4de6-b11e-ed79da03cd43	cmj0bs16u00001atx0vzfjs5n	ADJUST	-30	Điều chỉnh	2025-12-01 06:17:05.211	\N
7a1555a8-2cfc-42bf-a70c-f03933c3b0c5	95a46917-ffe2-48ce-81c7-70965ef1af39	cmj0bs16u00001atx0vzfjs5n	ADJUST	11	Điều chỉnh	2025-12-10 06:17:05.214	\N
594def3d-6e46-4477-95ae-ecb2ed9d5ba0	95a46917-ffe2-48ce-81c7-70965ef1af39	cmj0bs16u00001atx0vzfjs5n	ADJUST	-5	Sử dụng dịch vụ	2025-12-05 06:17:05.215	\N
01cdebfb-7dc1-4efa-afe7-9572ec6bcea4	95a46917-ffe2-48ce-81c7-70965ef1af39	cmj0bs16u00001atx0vzfjs5n	OUT	186	Nhập hàng	2025-12-06 06:17:05.216	\N
3878baaf-34e6-47d3-b3ab-962478ebf857	95a46917-ffe2-48ce-81c7-70965ef1af39	cmj0bs16u00001atx0vzfjs5n	OUT	102	Pha chế	2025-11-21 06:17:05.216	\N
2ef1b828-ea5a-42a5-91fd-89dafa76c978	95a46917-ffe2-48ce-81c7-70965ef1af39	cmj0bs16u00001atx0vzfjs5n	ADJUST	15	Nhập hàng	2025-12-11 06:17:05.217	\N
157311aa-5a44-4d88-9762-55bcd3cbb86d	5a82e509-d4bc-46ab-bf32-1dced713f545	cmj0bs16u00001atx0vzfjs5n	OUT	116	Nhập hàng	2025-11-13 06:17:05.219	\N
adceb0e8-868c-450a-a7dd-f6e0916b1506	5a82e509-d4bc-46ab-bf32-1dced713f545	cmj0bs16u00001atx0vzfjs5n	IN	426	Xuất kho	2025-12-07 06:17:05.219	\N
923470ca-406f-47f4-8c1c-6fbc8fc917b5	5a82e509-d4bc-46ab-bf32-1dced713f545	cmj0bs16u00001atx0vzfjs5n	IN	387	Điều chỉnh	2025-11-12 06:17:05.22	\N
ee619ed6-ec5c-4d36-aa7f-f42c1670e551	5a82e509-d4bc-46ab-bf32-1dced713f545	cmj0bs16u00001atx0vzfjs5n	ADJUST	-45	Pha chế	2025-12-08 06:17:05.22	\N
cd73a909-684e-40ad-bc43-64c6f544af40	38634b2c-71cd-4b7a-afc4-1c79b5b8aa5e	cmj0bs16u00001atx0vzfjs5n	OUT	102	Sử dụng dịch vụ	2025-11-20 06:17:05.223	\N
3fbca9f0-553a-4306-bce5-76f3fe2fb483	38634b2c-71cd-4b7a-afc4-1c79b5b8aa5e	cmj0bs16u00001atx0vzfjs5n	OUT	141	Nhập hàng	2025-11-18 06:17:05.223	\N
deaa5c7a-be0f-4664-a9a6-696ea2585188	38634b2c-71cd-4b7a-afc4-1c79b5b8aa5e	cmj0bs16u00001atx0vzfjs5n	ADJUST	46	Sử dụng dịch vụ	2025-12-08 06:17:05.224	\N
ee36a9e8-881c-49ec-903a-6d4a7795a220	38634b2c-71cd-4b7a-afc4-1c79b5b8aa5e	cmj0bs16u00001atx0vzfjs5n	IN	269	Điều chỉnh	2025-11-12 06:17:05.224	\N
a6ee0e3b-da2a-44fc-961d-95881de7318f	ed72b327-13fa-4902-a5d9-90a24639b1a7	cmj0bs16u00001atx0vzfjs5n	IN	447	Điều chỉnh	2025-11-17 06:17:05.227	\N
47004b07-6dd7-4a8f-bfdb-3c99b2e388f3	ed72b327-13fa-4902-a5d9-90a24639b1a7	cmj0bs16u00001atx0vzfjs5n	ADJUST	27	Pha chế	2025-11-13 06:17:05.227	\N
dc8707be-fed7-4b21-a8cb-941a4e0b46bf	ed72b327-13fa-4902-a5d9-90a24639b1a7	cmj0bs16u00001atx0vzfjs5n	OUT	148	Nhập hàng	2025-11-26 06:17:05.228	\N
eb7c5e90-5d71-467c-b973-bec4a1f88d87	ed72b327-13fa-4902-a5d9-90a24639b1a7	cmj0bs16u00001atx0vzfjs5n	IN	383	Sử dụng dịch vụ	2025-12-04 06:17:05.228	\N
ccb30e3a-a500-4cf3-864b-a6b37b9e4bf4	ed72b327-13fa-4902-a5d9-90a24639b1a7	cmj0bs16u00001atx0vzfjs5n	OUT	192	Sử dụng dịch vụ	2025-11-22 06:17:05.228	\N
53b93245-8255-4850-80cc-cddc2ebecdc1	3823207f-9f25-4e97-af86-75fa0460f889	cmj0bs16u00001atx0vzfjs5n	OUT	249	Sử dụng dịch vụ	2025-11-26 06:17:05.231	\N
4dc4bc91-d5ab-4ca1-a207-c5d64249ea83	3823207f-9f25-4e97-af86-75fa0460f889	cmj0bs16u00001atx0vzfjs5n	OUT	236	Pha chế	2025-12-05 06:17:05.231	\N
70d7bb16-80d7-426f-8e7d-ddc3e61988e7	3823207f-9f25-4e97-af86-75fa0460f889	cmj0bs16u00001atx0vzfjs5n	IN	435	Sử dụng dịch vụ	2025-12-01 06:17:05.232	\N
cc6e78c3-808e-4dde-9a16-ab952d3dcb37	3823207f-9f25-4e97-af86-75fa0460f889	cmj0bs16u00001atx0vzfjs5n	IN	540	Nhập hàng	2025-12-02 06:17:05.232	\N
196c5085-278e-415f-970e-9cb3ab44bc67	3823207f-9f25-4e97-af86-75fa0460f889	cmj0bs16u00001atx0vzfjs5n	OUT	152	Nhập hàng	2025-11-29 06:17:05.233	\N
f66f0c37-eef5-41d8-8534-953972a42c8f	e28eb638-ab36-432c-ab4d-0f1e0dae4539	cmj0bs16u00001atx0vzfjs5n	IN	547	Điều chỉnh	2025-12-01 06:17:05.235	\N
5cb7c5dd-c84b-4c90-a367-88b2dba8e27f	e28eb638-ab36-432c-ab4d-0f1e0dae4539	cmj0bs16u00001atx0vzfjs5n	ADJUST	-10	Điều chỉnh	2025-12-11 06:17:05.235	\N
4b53166d-7a42-42b3-ad41-f64bc99e0f6f	e28eb638-ab36-432c-ab4d-0f1e0dae4539	cmj0bs16u00001atx0vzfjs5n	IN	153	Pha chế	2025-12-03 06:17:05.236	\N
28ab39da-92b4-4929-8f2d-ea129077d648	0d660156-03d5-42a5-83f8-846850e96fbd	cmj0bs16u00001atx0vzfjs5n	OUT	144	Điều chỉnh	2025-12-04 06:17:05.238	\N
e6edfedf-ee67-46a3-94ae-7607243b4366	0d660156-03d5-42a5-83f8-846850e96fbd	cmj0bs16u00001atx0vzfjs5n	OUT	164	Điều chỉnh	2025-11-18 06:17:05.238	\N
99b0d41a-eb67-461a-becf-8b3574a82b12	0d660156-03d5-42a5-83f8-846850e96fbd	cmj0bs16u00001atx0vzfjs5n	OUT	83	Pha chế	2025-11-17 06:17:05.239	\N
2dd19c9f-498d-48d4-9bdc-83cf7621aa49	0d660156-03d5-42a5-83f8-846850e96fbd	cmj0bs16u00001atx0vzfjs5n	OUT	53	Pha chế	2025-11-13 06:17:05.24	\N
97c47eab-8af2-4473-b458-99cadf257391	0dc5eeae-9aa6-4392-8caf-b7a1bf5d86a7	cmj0bs16u00001atx0vzfjs5n	ADJUST	17	Xuất kho	2025-11-15 06:17:05.241	\N
3b539924-5bad-4387-b3db-8661fae1b5bc	0dc5eeae-9aa6-4392-8caf-b7a1bf5d86a7	cmj0bs16u00001atx0vzfjs5n	ADJUST	2	Nhập hàng	2025-12-01 06:17:05.242	\N
03946ccd-9a8d-40a3-81a5-da78e6eabd9d	0dc5eeae-9aa6-4392-8caf-b7a1bf5d86a7	cmj0bs16u00001atx0vzfjs5n	OUT	214	Sử dụng dịch vụ	2025-11-22 06:17:05.242	\N
2c0219ac-407f-4c2a-97a3-36dd96c0c326	0dc5eeae-9aa6-4392-8caf-b7a1bf5d86a7	cmj0bs16u00001atx0vzfjs5n	OUT	51	Xuất kho	2025-11-27 06:17:05.243	\N
09e5749d-56d4-4ff1-b3c3-3606021fda3e	722231cf-5e67-409b-af6c-3a1dcdf0783d	cmj0bs16u00001atx0vzfjs5n	IN	272	Pha chế	2025-12-07 06:17:05.245	\N
a430c5c3-957c-4995-9767-f20c87f095ca	722231cf-5e67-409b-af6c-3a1dcdf0783d	cmj0bs16u00001atx0vzfjs5n	OUT	168	Sử dụng dịch vụ	2025-11-20 06:17:05.245	\N
b6f39c41-f66d-4a19-b6ac-f62808d04ffa	722231cf-5e67-409b-af6c-3a1dcdf0783d	cmj0bs16u00001atx0vzfjs5n	OUT	249	Sử dụng dịch vụ	2025-11-14 06:17:05.246	\N
b8076637-d918-4b6c-956d-d33578cf09b2	722231cf-5e67-409b-af6c-3a1dcdf0783d	cmj0bs16u00001atx0vzfjs5n	ADJUST	-47	Pha chế	2025-12-04 06:17:05.246	\N
f2c18fd5-ab96-4281-accc-46e55fac97af	97fac3e6-a165-4c5d-bc7c-f01d8c18a01a	cmj0bs16u00001atx0vzfjs5n	ADJUST	-36	Xuất kho	2025-11-16 13:55:28.96	\N
a14914b9-fc43-4209-af8a-9ee29908ade7	97fac3e6-a165-4c5d-bc7c-f01d8c18a01a	cmj0bs16u00001atx0vzfjs5n	IN	166	Xuất kho	2025-12-07 13:55:28.962	\N
bcd987c4-dd07-4f17-a8dc-d35b53352a2e	97fac3e6-a165-4c5d-bc7c-f01d8c18a01a	cmj0bs16u00001atx0vzfjs5n	IN	471	Sử dụng dịch vụ	2025-11-15 13:55:28.963	\N
bc92c2ff-53e0-44ff-a562-72931b9988df	97fac3e6-a165-4c5d-bc7c-f01d8c18a01a	cmj0bs16u00001atx0vzfjs5n	IN	345	Xuất kho	2025-11-30 13:55:28.963	\N
57dd04f0-360b-49d9-bdf8-fee99559bb13	97fac3e6-a165-4c5d-bc7c-f01d8c18a01a	cmj0bs16u00001atx0vzfjs5n	IN	363	Điều chỉnh	2025-11-23 13:55:28.964	\N
f845c4b2-dc45-4b9f-8070-67e242a53ca5	7b2beb94-6012-4ec2-98ad-84930564e2c7	cmj0bs16u00001atx0vzfjs5n	IN	287	Xuất kho	2025-11-14 13:55:28.967	\N
54bbe79d-37f6-410b-8116-39086d4df6c5	7b2beb94-6012-4ec2-98ad-84930564e2c7	cmj0bs16u00001atx0vzfjs5n	ADJUST	6	Pha chế	2025-11-14 13:55:28.968	\N
8806375f-c061-4e53-9ba5-e478c5ade533	7b2beb94-6012-4ec2-98ad-84930564e2c7	cmj0bs16u00001atx0vzfjs5n	IN	508	Pha chế	2025-12-04 13:55:28.968	\N
a192c689-0baa-4372-8970-76d38dce8abf	7b2beb94-6012-4ec2-98ad-84930564e2c7	cmj0bs16u00001atx0vzfjs5n	OUT	125	Xuất kho	2025-11-29 13:55:28.969	\N
0b7cc798-7977-4783-8d1d-cdfc9af963a7	d26f25c7-7aa5-435a-9f0b-9b36da83a407	cmj0bs16u00001atx0vzfjs5n	OUT	77	Điều chỉnh	2025-11-23 13:55:28.971	\N
d6e8c6f1-7687-454f-953a-b945c4851b12	d26f25c7-7aa5-435a-9f0b-9b36da83a407	cmj0bs16u00001atx0vzfjs5n	OUT	102	Nhập hàng	2025-11-27 13:55:28.972	\N
7e1bb354-dd69-4de4-af4a-7fbde51174cf	d26f25c7-7aa5-435a-9f0b-9b36da83a407	cmj0bs16u00001atx0vzfjs5n	ADJUST	32	Điều chỉnh	2025-12-09 13:55:28.972	\N
6a791ec1-6468-452f-94b2-f6e2aa48e3bb	d26f25c7-7aa5-435a-9f0b-9b36da83a407	cmj0bs16u00001atx0vzfjs5n	IN	221	Điều chỉnh	2025-11-18 13:55:28.973	\N
51951806-d939-4b31-b638-b81fb462a1ef	d26f25c7-7aa5-435a-9f0b-9b36da83a407	cmj0bs16u00001atx0vzfjs5n	OUT	157	Xuất kho	2025-11-19 13:55:28.973	\N
bd2a2250-9eef-43d5-9bcd-7377c18fd76a	086d1d26-d9ac-4a13-a027-abe4b5ee420b	cmj0bs16u00001atx0vzfjs5n	IN	570	Pha chế	2025-12-02 13:55:28.975	\N
830b8d03-6a95-47b1-a0d6-5d57cf9c8be9	086d1d26-d9ac-4a13-a027-abe4b5ee420b	cmj0bs16u00001atx0vzfjs5n	IN	576	Nhập hàng	2025-11-25 13:55:28.976	\N
57145918-b38f-4b34-a664-0fb548287099	086d1d26-d9ac-4a13-a027-abe4b5ee420b	cmj0bs16u00001atx0vzfjs5n	OUT	178	Điều chỉnh	2025-11-14 13:55:28.976	\N
6242ff58-b019-437c-9f07-a4f962ac0607	086d1d26-d9ac-4a13-a027-abe4b5ee420b	cmj0bs16u00001atx0vzfjs5n	ADJUST	-8	Nhập hàng	2025-11-14 13:55:28.977	\N
f45ea2d4-4ee7-4cde-9deb-f4181fad14c9	374a5e37-ef5a-4983-a690-0eb40ce26bed	cmj0bs16u00001atx0vzfjs5n	IN	125	Sử dụng dịch vụ	2025-12-09 13:55:28.979	\N
e0ee2417-ab93-4e12-b6bc-2887a005c886	374a5e37-ef5a-4983-a690-0eb40ce26bed	cmj0bs16u00001atx0vzfjs5n	IN	554	Pha chế	2025-11-21 13:55:28.98	\N
b1802034-ea88-4aab-9613-832db94f9425	374a5e37-ef5a-4983-a690-0eb40ce26bed	cmj0bs16u00001atx0vzfjs5n	ADJUST	24	Xuất kho	2025-11-26 13:55:28.98	\N
cf5c8465-d54c-437b-a83c-f0d6b024997b	3111bcec-d911-4cfd-a6f7-4b5fcb8f9bf0	cmj0bs16u00001atx0vzfjs5n	ADJUST	31	Nhập hàng	2025-12-04 13:55:28.983	\N
21d09c85-8af4-4e07-b81d-014130d8fad9	3111bcec-d911-4cfd-a6f7-4b5fcb8f9bf0	cmj0bs16u00001atx0vzfjs5n	IN	517	Pha chế	2025-11-28 13:55:28.983	\N
bddd25ef-47c9-49c6-9c25-07b1260c155b	3111bcec-d911-4cfd-a6f7-4b5fcb8f9bf0	cmj0bs16u00001atx0vzfjs5n	OUT	73	Sử dụng dịch vụ	2025-12-10 13:55:28.984	\N
9b87ae27-c969-4d9f-b685-7a9dabed182d	3111bcec-d911-4cfd-a6f7-4b5fcb8f9bf0	cmj0bs16u00001atx0vzfjs5n	ADJUST	-7	Điều chỉnh	2025-12-11 13:55:28.985	\N
eec84cde-4bc7-4f7a-8750-58e8a2ae04cc	f4262979-add4-4de6-b11e-ed79da03cd43	cmj0bs16u00001atx0vzfjs5n	ADJUST	-1	Sử dụng dịch vụ	2025-11-21 13:55:28.988	\N
95b854f0-3906-4704-89fe-5ba0f9efdcc9	f4262979-add4-4de6-b11e-ed79da03cd43	cmj0bs16u00001atx0vzfjs5n	ADJUST	-17	Nhập hàng	2025-11-15 13:55:28.989	\N
92e4c87a-5e95-4196-b477-54a134b311bc	f4262979-add4-4de6-b11e-ed79da03cd43	cmj0bs16u00001atx0vzfjs5n	IN	111	Điều chỉnh	2025-12-06 13:55:28.989	\N
7743dbe3-b4d3-417e-a900-1ec284dd36a3	f4262979-add4-4de6-b11e-ed79da03cd43	cmj0bs16u00001atx0vzfjs5n	ADJUST	8	Pha chế	2025-12-03 13:55:28.989	\N
1d81232f-f504-469c-a428-44851a6f2e72	f4262979-add4-4de6-b11e-ed79da03cd43	cmj0bs16u00001atx0vzfjs5n	OUT	102	Xuất kho	2025-11-27 13:55:28.99	\N
e1cdb29a-d077-4982-a9bf-ab9363c74e41	95a46917-ffe2-48ce-81c7-70965ef1af39	cmj0bs16u00001atx0vzfjs5n	ADJUST	-25	Sử dụng dịch vụ	2025-12-11 13:55:28.992	\N
3b89b843-510f-46e8-8ac8-6fa2078c3701	95a46917-ffe2-48ce-81c7-70965ef1af39	cmj0bs16u00001atx0vzfjs5n	ADJUST	27	Điều chỉnh	2025-11-15 13:55:28.992	\N
db8d6ec6-dca6-4f94-975c-aaa03eb40959	95a46917-ffe2-48ce-81c7-70965ef1af39	cmj0bs16u00001atx0vzfjs5n	OUT	143	Sử dụng dịch vụ	2025-11-21 13:55:28.993	\N
58de3ec8-f0aa-4faf-acd5-ed28e12c63d4	95a46917-ffe2-48ce-81c7-70965ef1af39	cmj0bs16u00001atx0vzfjs5n	ADJUST	-14	Sử dụng dịch vụ	2025-12-01 13:55:28.993	\N
3e823919-c316-43e5-8fe2-0875636074eb	5a82e509-d4bc-46ab-bf32-1dced713f545	cmj0bs16u00001atx0vzfjs5n	IN	177	Điều chỉnh	2025-11-23 13:55:28.996	\N
7ffbd26b-6d2b-4e68-9a7b-ce92526e1009	5a82e509-d4bc-46ab-bf32-1dced713f545	cmj0bs16u00001atx0vzfjs5n	OUT	119	Sử dụng dịch vụ	2025-11-24 13:55:28.996	\N
74fb211e-0865-4c27-9d18-6fc26396e731	5a82e509-d4bc-46ab-bf32-1dced713f545	cmj0bs16u00001atx0vzfjs5n	OUT	85	Sử dụng dịch vụ	2025-11-13 13:55:28.996	\N
ab25e311-c10c-4e3c-b1e0-c674dda0a867	38634b2c-71cd-4b7a-afc4-1c79b5b8aa5e	cmj0bs16u00001atx0vzfjs5n	IN	595	Sử dụng dịch vụ	2025-12-04 13:55:28.998	\N
36354f68-05d3-4f7f-9a7a-480172f4d126	38634b2c-71cd-4b7a-afc4-1c79b5b8aa5e	cmj0bs16u00001atx0vzfjs5n	IN	237	Nhập hàng	2025-11-12 13:55:28.999	\N
17a471e1-58cb-42c0-8af7-33418d5775b6	38634b2c-71cd-4b7a-afc4-1c79b5b8aa5e	cmj0bs16u00001atx0vzfjs5n	ADJUST	16	Nhập hàng	2025-12-05 13:55:28.999	\N
d812c099-aa7b-4a1b-bfcd-1d580f04707e	ed72b327-13fa-4902-a5d9-90a24639b1a7	cmj0bs16u00001atx0vzfjs5n	ADJUST	-23	Sử dụng dịch vụ	2025-11-29 13:55:29.001	\N
a17b9d88-ff23-472b-b5a1-37f324858aa7	ed72b327-13fa-4902-a5d9-90a24639b1a7	cmj0bs16u00001atx0vzfjs5n	IN	250	Nhập hàng	2025-12-01 13:55:29.001	\N
76a4ab57-db66-4477-a5a9-6ebb41e92f54	ed72b327-13fa-4902-a5d9-90a24639b1a7	cmj0bs16u00001atx0vzfjs5n	ADJUST	-11	Pha chế	2025-11-16 13:55:29.002	\N
6cf04c16-aca3-4aa7-a195-351d5b957fe3	ed72b327-13fa-4902-a5d9-90a24639b1a7	cmj0bs16u00001atx0vzfjs5n	IN	471	Sử dụng dịch vụ	2025-11-22 13:55:29.002	\N
c84fd32b-6245-46a0-9b41-67ebf8cff146	3823207f-9f25-4e97-af86-75fa0460f889	cmj0bs16u00001atx0vzfjs5n	ADJUST	-26	Pha chế	2025-11-15 13:55:29.004	\N
783f7b1e-6bcd-4df0-8956-cacf45866d37	3823207f-9f25-4e97-af86-75fa0460f889	cmj0bs16u00001atx0vzfjs5n	IN	497	Nhập hàng	2025-11-15 13:55:29.005	\N
edb519de-a04c-40b4-8058-786102384027	3823207f-9f25-4e97-af86-75fa0460f889	cmj0bs16u00001atx0vzfjs5n	IN	449	Xuất kho	2025-11-26 13:55:29.005	\N
2ba73c0b-ea3e-445f-88c3-4875c4deacd0	e28eb638-ab36-432c-ab4d-0f1e0dae4539	cmj0bs16u00001atx0vzfjs5n	IN	401	Xuất kho	2025-12-04 13:55:29.007	\N
d3067cfe-4a38-461b-baae-1097b57c126a	e28eb638-ab36-432c-ab4d-0f1e0dae4539	cmj0bs16u00001atx0vzfjs5n	ADJUST	31	Điều chỉnh	2025-12-02 13:55:29.008	\N
eb496932-b2c0-421b-aba4-ad0738036097	e28eb638-ab36-432c-ab4d-0f1e0dae4539	cmj0bs16u00001atx0vzfjs5n	OUT	158	Xuất kho	2025-12-04 13:55:29.008	\N
e697024f-63de-43ed-a1fc-678fc9de5834	e28eb638-ab36-432c-ab4d-0f1e0dae4539	cmj0bs16u00001atx0vzfjs5n	ADJUST	-48	Nhập hàng	2025-11-18 13:55:29.008	\N
379c151b-a1a7-4edf-95d5-2d9f42f65280	0d660156-03d5-42a5-83f8-846850e96fbd	cmj0bs16u00001atx0vzfjs5n	IN	136	Sử dụng dịch vụ	2025-11-17 13:55:29.01	\N
694f3765-7c18-49fb-827b-db9c6178de0c	0d660156-03d5-42a5-83f8-846850e96fbd	cmj0bs16u00001atx0vzfjs5n	ADJUST	43	Điều chỉnh	2025-12-07 13:55:29.011	\N
7f4fec7b-5abe-4d61-89a6-04413f5ff4af	0d660156-03d5-42a5-83f8-846850e96fbd	cmj0bs16u00001atx0vzfjs5n	ADJUST	11	Sử dụng dịch vụ	2025-12-03 13:55:29.011	\N
943f93f6-917a-4ecd-b1f9-a91b0d1b1b57	0dc5eeae-9aa6-4392-8caf-b7a1bf5d86a7	cmj0bs16u00001atx0vzfjs5n	ADJUST	27	Nhập hàng	2025-12-03 13:55:29.013	\N
7757aeb5-8625-461d-a7d3-f2431b4da240	0dc5eeae-9aa6-4392-8caf-b7a1bf5d86a7	cmj0bs16u00001atx0vzfjs5n	ADJUST	-32	Điều chỉnh	2025-11-28 13:55:29.014	\N
5f56e50a-0e56-4e01-8e93-848ad820f462	0dc5eeae-9aa6-4392-8caf-b7a1bf5d86a7	cmj0bs16u00001atx0vzfjs5n	ADJUST	32	Nhập hàng	2025-11-21 13:55:29.014	\N
9374ad4f-515d-43f0-97be-6b6775f8b39e	0dc5eeae-9aa6-4392-8caf-b7a1bf5d86a7	cmj0bs16u00001atx0vzfjs5n	OUT	143	Pha chế	2025-11-30 13:55:29.015	\N
43122815-ef20-432e-a389-138cb91f6c71	0dc5eeae-9aa6-4392-8caf-b7a1bf5d86a7	cmj0bs16u00001atx0vzfjs5n	ADJUST	33	Sử dụng dịch vụ	2025-12-03 13:55:29.015	\N
6b44d88b-2e76-44c5-b08c-a4f9f98f1429	722231cf-5e67-409b-af6c-3a1dcdf0783d	cmj0bs16u00001atx0vzfjs5n	OUT	86	Nhập hàng	2025-12-06 13:55:29.018	\N
75f1f021-94d2-4515-9b61-6b2d2442d66f	722231cf-5e67-409b-af6c-3a1dcdf0783d	cmj0bs16u00001atx0vzfjs5n	OUT	148	Điều chỉnh	2025-12-11 13:55:29.018	\N
ecf4fcd2-befc-4193-8683-1e0df64c2d79	722231cf-5e67-409b-af6c-3a1dcdf0783d	cmj0bs16u00001atx0vzfjs5n	ADJUST	49	Điều chỉnh	2025-11-27 13:55:29.019	\N
07ea6f4f-b4b3-4c4e-b11c-0e2152e86c3c	722231cf-5e67-409b-af6c-3a1dcdf0783d	cmj0bs16u00001atx0vzfjs5n	OUT	58	Xuất kho	2025-11-20 13:55:29.019	\N
93998427-b1aa-4471-8d74-7e78f4760054	722231cf-5e67-409b-af6c-3a1dcdf0783d	cmj0bs16u00001atx0vzfjs5n	ADJUST	-8	Sử dụng dịch vụ	2025-11-19 13:55:29.019	\N
ab82430a-202e-4624-bfd5-83fc6de70887	ded2fec9-1b9f-43a1-9717-19d6fb6c2692	cmj0bs16u00001atx0vzfjs5n	ADJUST	10	adjustment	2025-12-12 02:58:39.701	\N
d6a13d36-72d1-4e4b-bfc0-d48ab0719f5f	ae494727-767f-4046-8c6e-45c8a0acfc1d	cmj0bs16u00001atx0vzfjs5n	IN	2	Phiếu nhập PN-2025-12-0001	2025-12-12 09:28:30.628	0a1bb87b-82de-4531-9635-51fc069b344e
\.


--
-- Data for Name: StockTransfer; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."StockTransfer" (id, "transferNumber", "fromBranchId", "toBranchId", date, status, "createdBy", "completedBy", "completedAt", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: StockTransferItem; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."StockTransferItem" (id, "transferId", "productId", quantity, "costPrice", notes) FROM stdin;
\.


--
-- Data for Name: StyleMatching; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."StyleMatching" (id, "customerId", "personalStyle", "styleTags", vibe, "matchedStyles", "matchedColors", confidence, "styleAnalysis", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: StylistAnalysis; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."StylistAnalysis" (id, "createdAt", "hairCondition", "hairHistory", "customerGoal", "curlType", "hairDamageLevel", "stylistNote", "resultJson") FROM stdin;
\.


--
-- Data for Name: StylistSignatureStyle; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."StylistSignatureStyle" (id, "staffId", specialties, "preferredCurlSize", "preferredColorTones", "preferredTechniques", "signatureStyle", "styleStrength", "typicalResults", "averageRating", "customerSatisfaction", "commonFormulas", "successfulStyles", "preferredSettings", "servicesCount", "lastAnalyzed", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: StylistSupportPanel; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."StylistSupportPanel" (id, "customerId", "bookingId", "faceAnalysisId", "hairConditionId", "hairstyleRecId", "colorRecId", "supportData", "faceShape", "hairCondition", "recommendedStyle", "recommendedColor", "productGuide", "formulaGuide", settings, warnings, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Supplier; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Supplier" (id, code, name, "contactName", phone, email, address, city, province, country, "taxCode", website, "paymentTerms", notes, "isActive", "createdAt", "updatedAt") FROM stdin;
35d7b984-1574-44bf-8415-ccabea3463c8	NCCGROWCO849771	Grow Cosmetis	\N	\N	\N	\N	\N	\N	VN	\N	\N	\N	\N	t	2025-12-12 07:17:29.773	2025-12-12 07:17:29.773
0942fec5-242e-4a99-8a89-a17c4d4a06bc	NCCGROWAN875817	Grow and Glow	\N	\N	\N	\N	\N	\N	VN	\N	\N	\N	\N	t	2025-12-12 07:17:55.819	2025-12-12 07:17:55.819
\.


--
-- Data for Name: TechnicalChecklist; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."TechnicalChecklist" (id, "serviceId", "serviceName", "bookingId", items, "completedItems", "pendingItems", "skippedItems", "completionRate", "isCompleted", "aiVerified", "aiWarnings", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ThresholdRule; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."ThresholdRule" (id, "productId", "productCategory", "serviceId", "serviceCategory", "normalMin", "normalMax", "warningMin", "warningMax", "alertMin", "alertMax", "criticalMin", "expectedMin", "expectedMax", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TierUpgradeHistory; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."TierUpgradeHistory" (id, "customerId", "membershipId", "previousTier", "newTier", "changeType", reason, "triggerType", criteria, "spendingAtChange", "visitsAtChange", "pointsAtChange", "createdAt") FROM stdin;
\.


--
-- Data for Name: TrainingExercise; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."TrainingExercise" (id, "lessonId", type, title, content, answer, points, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TrainingLesson; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."TrainingLesson" (id, "moduleId", title, content, "order", role, level, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TrainingLevel; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."TrainingLevel" (id, "roleId", level, name, description, requirements, modules, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TrainingModule; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."TrainingModule" (id, title, "desc", "order", category, role, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TrainingProgress; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."TrainingProgress" (id, "userId", "levelId", "moduleId", "lessonId", status, score, "completedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TrainingQuiz; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."TrainingQuiz" (id, "lessonId", questions, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TrainingQuizResult; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."TrainingQuizResult" (id, "userId", "quizId", score, total, answers, "createdAt") FROM stdin;
\.


--
-- Data for Name: TrainingRole; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."TrainingRole" (id, name, description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TreatmentPlan; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."TreatmentPlan" (id, "customerId", "scanId", "damageAssessmentId", "porosityAnalysisId", "chemicalRiskId", "scalpAnalysisId", "planType", duration, "immediateTreatment", "weeklyPlan", "homecarePlan", "permSuitability", "colorSuitability", "bleachSuitability", products, "expectedHealthScore", "expectedImprovement", status, "startedAt", "completedAt", "isAIGenerated", confidence, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TreatmentTracking; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."TreatmentTracking" (id, "customerId", "treatmentPlanId", "weekNumber", "healthScore", "previousScore", improvement, "damageReduction", "treatmentsDone", "productsUsed", notes, "customerFeedback", "aiAssessment", "trackedAt") FROM stdin;
\.


--
-- Data for Name: UpsaleMatrix; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."UpsaleMatrix" (id, "serviceId", "serviceName", "recommendedServices", "recommendedProducts", "upsaleType", priority, "conversionRate", conditions, script, benefits, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: UpsaleRecommendation; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."UpsaleRecommendation" (id, "customerId", "serviceId", "invoiceId", "recommendedServices", "recommendedProducts", combo, "isAIGenerated", confidence, reason, script, tone, status, "acceptedItems", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: UpsaleRecord; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."UpsaleRecord" (id, "invoiceId", "customerId", "staffId", "originalAmount", "upsaleAmount", "totalAmount", "originalItems", "upsaleItems", source, "recommendationId", "upsaleRate", "conversionType", "createdAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."User" (id, "partnerId", name, "trainingRole", "currentLevel", phone, password, role, "branchId", "createdAt", "updatedAt") FROM stdin;
f4620314-2df1-4c53-8262-c8b459f21d8b	\N	Admin User	\N	\N	0900000001	123456	ADMIN	\N	2025-12-10 11:45:10.21	2025-12-10 11:45:10.21
adb10200-718e-4da9-a64b-973fa94e6f61	\N	Manager User	\N	\N	0900000002	123456	MANAGER	\N	2025-12-11 06:07:31.497	2025-12-11 06:07:31.497
7ac48bbf-a8c5-4eb0-bfcc-7855249afba4	\N	Reception User	\N	\N	0900000003	123456	RECEPTIONIST	\N	2025-12-11 06:07:31.5	2025-12-11 06:07:31.5
6cc6e2a6-d6af-476e-a9c7-88d5c6ea023b	\N	Stylist User	\N	\N	0900000004	123456	STYLIST	\N	2025-12-11 06:07:31.501	2025-12-11 06:07:31.501
caf782a2-eea8-4936-8444-3d7d46a36cea	\N	Assistant User	\N	\N	0900000005	123456	ASSISTANT	\N	2025-12-11 06:07:31.502	2025-12-11 06:07:31.502
314c73da-e9ab-4885-ac7e-036ad347bdde	\N	Tam	\N	\N	hairsalonchitam@gmail.com	$2b$10$mndJbyLCL564TkVGA3AKaO4Mi1oElkRl3OHdxMKJ72nhPh9zDXL9q	STYLIST	\N	2025-12-12 11:28:58.76	2025-12-12 11:28:58.76
b90457cf-7e0d-4757-afd3-c211c01eb151	\N	Nhân viên 1	\N	\N	0910000001	$2a$10$dummy	STYLIST	\N	2025-12-12 14:45:14.574	2025-12-12 14:45:14.574
193e1e17-cfbc-4dea-978e-c9b4084f95fa	\N	Nhân viên 2	\N	\N	0910000002	$2a$10$dummy	ASSISTANT	\N	2025-12-12 14:45:14.579	2025-12-12 14:45:14.579
bdc7ec91-5bca-4572-aa4b-3e3ebbcb3b04	\N	Nhân viên 3	\N	\N	0910000003	$2a$10$dummy	RECEPTIONIST	\N	2025-12-12 14:45:14.58	2025-12-12 14:45:14.58
4feda926-705b-458a-8138-0e640ca85377	\N	Nhân viên 4	\N	\N	0910000004	$2a$10$dummy	STYLIST	\N	2025-12-12 14:45:14.58	2025-12-12 14:45:14.58
465f85bb-ab1b-4463-a368-ed9b50c62911	\N	Nhân viên 5	\N	\N	0910000005	$2a$10$dummy	ASSISTANT	\N	2025-12-12 14:45:14.581	2025-12-12 14:45:14.581
\.


--
-- Data for Name: VideoFrame; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."VideoFrame" (id, "videoId", "frameNumber", "timestamp", "imageUrl", analyzed, "analysisData", "createdAt") FROM stdin;
\.


--
-- Data for Name: Visit; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Visit" (id, "customerId", date, service, stylist, assistant, technical, "productsUsed", "totalCharge", "photosBefore", "photosAfter", rating, "followUpNotes", notes, tags, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: VoiceAnalytics; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."VoiceAnalytics" (id, "periodStart", "periodEnd", "periodType", "totalSessions", "totalInteractions", "avgDuration", "avgInteractions", "intentCounts", "resolutionRate", "bookingRate", "avgSentiment", "positiveRate", "satisfactionScore", "totalCalls", "avgCallDuration", "transferRate", "totalCommands", "commandSuccessRate", "branchId", "partnerId", "createdAt") FROM stdin;
\.


--
-- Data for Name: VoiceCommand; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."VoiceCommand" (id, "staffId", "branchId", "audioUrl", transcript, "commandType", parameters, intent, status, result, error, "responseText", "responseAudioUrl", "executedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: VoiceIntent; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."VoiceIntent" (id, intent, confidence, "sessionId", "interactionId", entities, resolved, "resolutionAction", "bookingId", "createdAt") FROM stdin;
\.


--
-- Data for Name: VoiceInteraction; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."VoiceInteraction" (id, "sessionId", sequence, speaker, "audioUrl", transcript, language, intent, entities, sentiment, emotion, "responseText", "responseAudioUrl", "responseStyle", "timestamp", duration, "createdAt") FROM stdin;
\.


--
-- Data for Name: VoiceSession; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."VoiceSession" (id, "sessionType", channel, "customerId", "customerPhone", "customerName", "staffId", "branchId", "partnerId", "startedAt", "endedAt", duration, status, summary, intent, resolved, "actionTaken", "callId", "callDirection", "transferToHuman", "transferReason", "recordingUrl", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WorkflowError; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."WorkflowError" (id, type, input, error, "rawOutput", "createdAt") FROM stdin;
\.


--
-- Data for Name: WorkflowRun; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."WorkflowRun" (id, type, input, output, "createdAt") FROM stdin;
\.


--
-- Data for Name: _MarketingCampaignToMarketingChannel; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."_MarketingCampaignToMarketingChannel" ("A", "B") FROM stdin;
\.


--
-- Name: AbandonedCart AbandonedCart_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."AbandonedCart"
    ADD CONSTRAINT "AbandonedCart_pkey" PRIMARY KEY (id);


--
-- Name: AutomationFlow AutomationFlow_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."AutomationFlow"
    ADD CONSTRAINT "AutomationFlow_pkey" PRIMARY KEY (id);


--
-- Name: AutomationLog AutomationLog_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."AutomationLog"
    ADD CONSTRAINT "AutomationLog_pkey" PRIMARY KEY (id);


--
-- Name: Booking Booking_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_pkey" PRIMARY KEY (id);


--
-- Name: BranchForecast BranchForecast_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."BranchForecast"
    ADD CONSTRAINT "BranchForecast_pkey" PRIMARY KEY (id);


--
-- Name: BranchInventory BranchInventory_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."BranchInventory"
    ADD CONSTRAINT "BranchInventory_pkey" PRIMARY KEY (id);


--
-- Name: BranchPerformance BranchPerformance_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."BranchPerformance"
    ADD CONSTRAINT "BranchPerformance_pkey" PRIMARY KEY (id);


--
-- Name: BranchStaffAssignment BranchStaffAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."BranchStaffAssignment"
    ADD CONSTRAINT "BranchStaffAssignment_pkey" PRIMARY KEY (id);


--
-- Name: Branch Branch_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Branch"
    ADD CONSTRAINT "Branch_pkey" PRIMARY KEY (id);


--
-- Name: COGSCalculation COGSCalculation_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."COGSCalculation"
    ADD CONSTRAINT "COGSCalculation_pkey" PRIMARY KEY (id);


--
-- Name: Cashflow Cashflow_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Cashflow"
    ADD CONSTRAINT "Cashflow_pkey" PRIMARY KEY (id);


--
-- Name: Certification Certification_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Certification"
    ADD CONSTRAINT "Certification_pkey" PRIMARY KEY (id);


--
-- Name: ChemicalHistoryRisk ChemicalHistoryRisk_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ChemicalHistoryRisk"
    ADD CONSTRAINT "ChemicalHistoryRisk_pkey" PRIMARY KEY (id);


--
-- Name: ColorAnalysis ColorAnalysis_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ColorAnalysis"
    ADD CONSTRAINT "ColorAnalysis_pkey" PRIMARY KEY (id);


--
-- Name: ColorRecommendation ColorRecommendation_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ColorRecommendation"
    ADD CONSTRAINT "ColorRecommendation_pkey" PRIMARY KEY (id);


--
-- Name: CommissionRecord CommissionRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CommissionRecord"
    ADD CONSTRAINT "CommissionRecord_pkey" PRIMARY KEY (id);


--
-- Name: CompetitorAnalysis CompetitorAnalysis_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CompetitorAnalysis"
    ADD CONSTRAINT "CompetitorAnalysis_pkey" PRIMARY KEY (id);


--
-- Name: ConsistencyMetrics ConsistencyMetrics_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ConsistencyMetrics"
    ADD CONSTRAINT "ConsistencyMetrics_pkey" PRIMARY KEY (id);


--
-- Name: ConsumptionTracking ConsumptionTracking_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ConsumptionTracking"
    ADD CONSTRAINT "ConsumptionTracking_pkey" PRIMARY KEY (id);


--
-- Name: ContentLibrary ContentLibrary_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ContentLibrary"
    ADD CONSTRAINT "ContentLibrary_pkey" PRIMARY KEY (id);


--
-- Name: CorrectionSuggestion CorrectionSuggestion_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CorrectionSuggestion"
    ADD CONSTRAINT "CorrectionSuggestion_pkey" PRIMARY KEY (id);


--
-- Name: CrossBranchQuality CrossBranchQuality_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CrossBranchQuality"
    ADD CONSTRAINT "CrossBranchQuality_pkey" PRIMARY KEY (id);


--
-- Name: CurlPatternAnalysis CurlPatternAnalysis_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CurlPatternAnalysis"
    ADD CONSTRAINT "CurlPatternAnalysis_pkey" PRIMARY KEY (id);


--
-- Name: CustomerBehavior CustomerBehavior_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerBehavior"
    ADD CONSTRAINT "CustomerBehavior_pkey" PRIMARY KEY (id);


--
-- Name: CustomerExperience CustomerExperience_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerExperience"
    ADD CONSTRAINT "CustomerExperience_pkey" PRIMARY KEY (id);


--
-- Name: CustomerInsight CustomerInsight_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerInsight"
    ADD CONSTRAINT "CustomerInsight_pkey" PRIMARY KEY (id);


--
-- Name: CustomerJourney CustomerJourney_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerJourney"
    ADD CONSTRAINT "CustomerJourney_pkey" PRIMARY KEY (id);


--
-- Name: CustomerLoyalty CustomerLoyalty_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerLoyalty"
    ADD CONSTRAINT "CustomerLoyalty_pkey" PRIMARY KEY (id);


--
-- Name: CustomerMembership CustomerMembership_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerMembership"
    ADD CONSTRAINT "CustomerMembership_pkey" PRIMARY KEY (id);


--
-- Name: CustomerPersonalityProfile CustomerPersonalityProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerPersonalityProfile"
    ADD CONSTRAINT "CustomerPersonalityProfile_pkey" PRIMARY KEY (id);


--
-- Name: CustomerPhoto CustomerPhoto_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerPhoto"
    ADD CONSTRAINT "CustomerPhoto_pkey" PRIMARY KEY (id);


--
-- Name: CustomerPrediction CustomerPrediction_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerPrediction"
    ADD CONSTRAINT "CustomerPrediction_pkey" PRIMARY KEY (id);


--
-- Name: CustomerProfile CustomerProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerProfile"
    ADD CONSTRAINT "CustomerProfile_pkey" PRIMARY KEY (id);


--
-- Name: CustomerRiskAlert CustomerRiskAlert_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerRiskAlert"
    ADD CONSTRAINT "CustomerRiskAlert_pkey" PRIMARY KEY (id);


--
-- Name: CustomerStyleHistory CustomerStyleHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerStyleHistory"
    ADD CONSTRAINT "CustomerStyleHistory_pkey" PRIMARY KEY (id);


--
-- Name: CustomerTag CustomerTag_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerTag"
    ADD CONSTRAINT "CustomerTag_pkey" PRIMARY KEY (id);


--
-- Name: CustomerTouchpoint CustomerTouchpoint_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerTouchpoint"
    ADD CONSTRAINT "CustomerTouchpoint_pkey" PRIMARY KEY (id);


--
-- Name: Customer Customer_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Customer"
    ADD CONSTRAINT "Customer_pkey" PRIMARY KEY (id);


--
-- Name: DailyReport DailyReport_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."DailyReport"
    ADD CONSTRAINT "DailyReport_pkey" PRIMARY KEY (id);


--
-- Name: DamageLevelAssessment DamageLevelAssessment_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."DamageLevelAssessment"
    ADD CONSTRAINT "DamageLevelAssessment_pkey" PRIMARY KEY (id);


--
-- Name: DynamicPricing DynamicPricing_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."DynamicPricing"
    ADD CONSTRAINT "DynamicPricing_pkey" PRIMARY KEY (id);


--
-- Name: ErrorDetection ErrorDetection_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ErrorDetection"
    ADD CONSTRAINT "ErrorDetection_pkey" PRIMARY KEY (id);


--
-- Name: ExerciseSubmission ExerciseSubmission_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ExerciseSubmission"
    ADD CONSTRAINT "ExerciseSubmission_pkey" PRIMARY KEY (id);


--
-- Name: Expense Expense_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_pkey" PRIMARY KEY (id);


--
-- Name: FaceAnalysis FaceAnalysis_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."FaceAnalysis"
    ADD CONSTRAINT "FaceAnalysis_pkey" PRIMARY KEY (id);


--
-- Name: FinancialForecast FinancialForecast_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."FinancialForecast"
    ADD CONSTRAINT "FinancialForecast_pkey" PRIMARY KEY (id);


--
-- Name: FinancialMetric FinancialMetric_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."FinancialMetric"
    ADD CONSTRAINT "FinancialMetric_pkey" PRIMARY KEY (id);


--
-- Name: FinancialRiskAlert FinancialRiskAlert_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."FinancialRiskAlert"
    ADD CONSTRAINT "FinancialRiskAlert_pkey" PRIMARY KEY (id);


--
-- Name: FollowUpMessage FollowUpMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."FollowUpMessage"
    ADD CONSTRAINT "FollowUpMessage_pkey" PRIMARY KEY (id);


--
-- Name: HQNotification HQNotification_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."HQNotification"
    ADD CONSTRAINT "HQNotification_pkey" PRIMARY KEY (id);


--
-- Name: HairAnalysisVideo HairAnalysisVideo_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."HairAnalysisVideo"
    ADD CONSTRAINT "HairAnalysisVideo_pkey" PRIMARY KEY (id);


--
-- Name: HairConditionAnalysis HairConditionAnalysis_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."HairConditionAnalysis"
    ADD CONSTRAINT "HairConditionAnalysis_pkey" PRIMARY KEY (id);


--
-- Name: HairDamageMapping HairDamageMapping_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."HairDamageMapping"
    ADD CONSTRAINT "HairDamageMapping_pkey" PRIMARY KEY (id);


--
-- Name: HairElasticityAnalysis HairElasticityAnalysis_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."HairElasticityAnalysis"
    ADD CONSTRAINT "HairElasticityAnalysis_pkey" PRIMARY KEY (id);


--
-- Name: HairFormula HairFormula_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."HairFormula"
    ADD CONSTRAINT "HairFormula_pkey" PRIMARY KEY (id);


--
-- Name: HairHealthScan HairHealthScan_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."HairHealthScan"
    ADD CONSTRAINT "HairHealthScan_pkey" PRIMARY KEY (id);


--
-- Name: HairMovementAnalysis HairMovementAnalysis_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."HairMovementAnalysis"
    ADD CONSTRAINT "HairMovementAnalysis_pkey" PRIMARY KEY (id);


--
-- Name: HairProcedure HairProcedure_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."HairProcedure"
    ADD CONSTRAINT "HairProcedure_pkey" PRIMARY KEY (id);


--
-- Name: HairSimulation HairSimulation_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."HairSimulation"
    ADD CONSTRAINT "HairSimulation_pkey" PRIMARY KEY (id);


--
-- Name: HairStyleAnalysis HairStyleAnalysis_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."HairStyleAnalysis"
    ADD CONSTRAINT "HairStyleAnalysis_pkey" PRIMARY KEY (id);


--
-- Name: HairStyleImage HairStyleImage_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."HairStyleImage"
    ADD CONSTRAINT "HairStyleImage_pkey" PRIMARY KEY (id);


--
-- Name: HairSurfaceAnalysis HairSurfaceAnalysis_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."HairSurfaceAnalysis"
    ADD CONSTRAINT "HairSurfaceAnalysis_pkey" PRIMARY KEY (id);


--
-- Name: HairVideoRecommendation HairVideoRecommendation_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."HairVideoRecommendation"
    ADD CONSTRAINT "HairVideoRecommendation_pkey" PRIMARY KEY (id);


--
-- Name: HairstyleRecommendation HairstyleRecommendation_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."HairstyleRecommendation"
    ADD CONSTRAINT "HairstyleRecommendation_pkey" PRIMARY KEY (id);


--
-- Name: InventoryProjection InventoryProjection_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."InventoryProjection"
    ADD CONSTRAINT "InventoryProjection_pkey" PRIMARY KEY (id);


--
-- Name: InvoiceItem InvoiceItem_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY (id);


--
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY (id);


--
-- Name: KPISummary KPISummary_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."KPISummary"
    ADD CONSTRAINT "KPISummary_pkey" PRIMARY KEY (id);


--
-- Name: License License_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."License"
    ADD CONSTRAINT "License_pkey" PRIMARY KEY (id);


--
-- Name: Location Location_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Location"
    ADD CONSTRAINT "Location_pkey" PRIMARY KEY (id);


--
-- Name: LossAlert LossAlert_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."LossAlert"
    ADD CONSTRAINT "LossAlert_pkey" PRIMARY KEY (id);


--
-- Name: LoyaltyPoint LoyaltyPoint_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."LoyaltyPoint"
    ADD CONSTRAINT "LoyaltyPoint_pkey" PRIMARY KEY (id);


--
-- Name: LoyaltyPrediction LoyaltyPrediction_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."LoyaltyPrediction"
    ADD CONSTRAINT "LoyaltyPrediction_pkey" PRIMARY KEY (id);


--
-- Name: LoyaltyTier LoyaltyTier_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."LoyaltyTier"
    ADD CONSTRAINT "LoyaltyTier_pkey" PRIMARY KEY (id);


--
-- Name: MarketingAutomation MarketingAutomation_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."MarketingAutomation"
    ADD CONSTRAINT "MarketingAutomation_pkey" PRIMARY KEY (id);


--
-- Name: MarketingCampaign MarketingCampaign_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."MarketingCampaign"
    ADD CONSTRAINT "MarketingCampaign_pkey" PRIMARY KEY (id);


--
-- Name: MarketingChannel MarketingChannel_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."MarketingChannel"
    ADD CONSTRAINT "MarketingChannel_pkey" PRIMARY KEY (id);


--
-- Name: MarketingContent MarketingContent_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."MarketingContent"
    ADD CONSTRAINT "MarketingContent_pkey" PRIMARY KEY (id);


--
-- Name: MarketingDataPoint MarketingDataPoint_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."MarketingDataPoint"
    ADD CONSTRAINT "MarketingDataPoint_pkey" PRIMARY KEY (id);


--
-- Name: MarketingLog MarketingLog_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."MarketingLog"
    ADD CONSTRAINT "MarketingLog_pkey" PRIMARY KEY (id);


--
-- Name: MarketingSegment MarketingSegment_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."MarketingSegment"
    ADD CONSTRAINT "MarketingSegment_pkey" PRIMARY KEY (id);


--
-- Name: MarketingTrend MarketingTrend_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."MarketingTrend"
    ADD CONSTRAINT "MarketingTrend_pkey" PRIMARY KEY (id);


--
-- Name: MembershipMetric MembershipMetric_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."MembershipMetric"
    ADD CONSTRAINT "MembershipMetric_pkey" PRIMARY KEY (id);


--
-- Name: MembershipTier MembershipTier_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."MembershipTier"
    ADD CONSTRAINT "MembershipTier_pkey" PRIMARY KEY (id);


--
-- Name: MinaMemory MinaMemory_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."MinaMemory"
    ADD CONSTRAINT "MinaMemory_pkey" PRIMARY KEY (id);


--
-- Name: MixLog MixLog_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."MixLog"
    ADD CONSTRAINT "MixLog_pkey" PRIMARY KEY (id);


--
-- Name: MonthlyReport MonthlyReport_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."MonthlyReport"
    ADD CONSTRAINT "MonthlyReport_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: OperationLog OperationLog_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."OperationLog"
    ADD CONSTRAINT "OperationLog_pkey" PRIMARY KEY (id);


--
-- Name: PartnerPerformance PartnerPerformance_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."PartnerPerformance"
    ADD CONSTRAINT "PartnerPerformance_pkey" PRIMARY KEY (id);


--
-- Name: PartnerQualityScore PartnerQualityScore_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."PartnerQualityScore"
    ADD CONSTRAINT "PartnerQualityScore_pkey" PRIMARY KEY (id);


--
-- Name: Partner Partner_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Partner"
    ADD CONSTRAINT "Partner_pkey" PRIMARY KEY (id);


--
-- Name: PeakHourDetection PeakHourDetection_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."PeakHourDetection"
    ADD CONSTRAINT "PeakHourDetection_pkey" PRIMARY KEY (id);


--
-- Name: PersonalizationMetric PersonalizationMetric_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."PersonalizationMetric"
    ADD CONSTRAINT "PersonalizationMetric_pkey" PRIMARY KEY (id);


--
-- Name: PersonalizedFollowUp PersonalizedFollowUp_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."PersonalizedFollowUp"
    ADD CONSTRAINT "PersonalizedFollowUp_pkey" PRIMARY KEY (id);


--
-- Name: PersonalizedRecommendation PersonalizedRecommendation_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."PersonalizedRecommendation"
    ADD CONSTRAINT "PersonalizedRecommendation_pkey" PRIMARY KEY (id);


--
-- Name: PointsTransaction PointsTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."PointsTransaction"
    ADD CONSTRAINT "PointsTransaction_pkey" PRIMARY KEY (id);


--
-- Name: PorosityElasticityAnalysis PorosityElasticityAnalysis_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."PorosityElasticityAnalysis"
    ADD CONSTRAINT "PorosityElasticityAnalysis_pkey" PRIMARY KEY (id);


--
-- Name: PostServiceAudit PostServiceAudit_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."PostServiceAudit"
    ADD CONSTRAINT "PostServiceAudit_pkey" PRIMARY KEY (id);


--
-- Name: PricingHistory PricingHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."PricingHistory"
    ADD CONSTRAINT "PricingHistory_pkey" PRIMARY KEY (id);


--
-- Name: PricingOptimization PricingOptimization_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."PricingOptimization"
    ADD CONSTRAINT "PricingOptimization_pkey" PRIMARY KEY (id);


--
-- Name: PricingRule PricingRule_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."PricingRule"
    ADD CONSTRAINT "PricingRule_pkey" PRIMARY KEY (id);


--
-- Name: ProductCategory ProductCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ProductCategory"
    ADD CONSTRAINT "ProductCategory_pkey" PRIMARY KEY (id);


--
-- Name: ProductStock ProductStock_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ProductStock"
    ADD CONSTRAINT "ProductStock_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: ProfitCalculation ProfitCalculation_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ProfitCalculation"
    ADD CONSTRAINT "ProfitCalculation_pkey" PRIMARY KEY (id);


--
-- Name: QualityScore QualityScore_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."QualityScore"
    ADD CONSTRAINT "QualityScore_pkey" PRIMARY KEY (id);


--
-- Name: Reminder Reminder_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Reminder"
    ADD CONSTRAINT "Reminder_pkey" PRIMARY KEY (id);


--
-- Name: RestockRecommendation RestockRecommendation_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."RestockRecommendation"
    ADD CONSTRAINT "RestockRecommendation_pkey" PRIMARY KEY (id);


--
-- Name: RestockTrigger RestockTrigger_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."RestockTrigger"
    ADD CONSTRAINT "RestockTrigger_pkey" PRIMARY KEY (id);


--
-- Name: Revenue Revenue_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Revenue"
    ADD CONSTRAINT "Revenue_pkey" PRIMARY KEY (id);


--
-- Name: RewardCatalog RewardCatalog_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."RewardCatalog"
    ADD CONSTRAINT "RewardCatalog_pkey" PRIMARY KEY (id);


--
-- Name: RewardRedemption RewardRedemption_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."RewardRedemption"
    ADD CONSTRAINT "RewardRedemption_pkey" PRIMARY KEY (id);


--
-- Name: RoleplaySession RoleplaySession_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."RoleplaySession"
    ADD CONSTRAINT "RoleplaySession_pkey" PRIMARY KEY (id);


--
-- Name: SOPEnforcement SOPEnforcement_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."SOPEnforcement"
    ADD CONSTRAINT "SOPEnforcement_pkey" PRIMARY KEY (id);


--
-- Name: SOP SOP_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."SOP"
    ADD CONSTRAINT "SOP_pkey" PRIMARY KEY (id);


--
-- Name: SalaryPayout SalaryPayout_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."SalaryPayout"
    ADD CONSTRAINT "SalaryPayout_pkey" PRIMARY KEY (id);


--
-- Name: SalesFunnel SalesFunnel_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."SalesFunnel"
    ADD CONSTRAINT "SalesFunnel_pkey" PRIMARY KEY (id);


--
-- Name: ScalpConditionAnalysis ScalpConditionAnalysis_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ScalpConditionAnalysis"
    ADD CONSTRAINT "ScalpConditionAnalysis_pkey" PRIMARY KEY (id);


--
-- Name: ServiceCost ServiceCost_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ServiceCost"
    ADD CONSTRAINT "ServiceCost_pkey" PRIMARY KEY (id);


--
-- Name: ServiceProductUsage ServiceProductUsage_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ServiceProductUsage"
    ADD CONSTRAINT "ServiceProductUsage_pkey" PRIMARY KEY (id);


--
-- Name: ServiceSOP ServiceSOP_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ServiceSOP"
    ADD CONSTRAINT "ServiceSOP_pkey" PRIMARY KEY (id);


--
-- Name: Service Service_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Service"
    ADD CONSTRAINT "Service_pkey" PRIMARY KEY (id);


--
-- Name: SimulationSession SimulationSession_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."SimulationSession"
    ADD CONSTRAINT "SimulationSession_pkey" PRIMARY KEY (id);


--
-- Name: SkillAssessment SkillAssessment_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."SkillAssessment"
    ADD CONSTRAINT "SkillAssessment_pkey" PRIMARY KEY (id);


--
-- Name: SkillProgress SkillProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."SkillProgress"
    ADD CONSTRAINT "SkillProgress_pkey" PRIMARY KEY (id);


--
-- Name: SmartDiscount SmartDiscount_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."SmartDiscount"
    ADD CONSTRAINT "SmartDiscount_pkey" PRIMARY KEY (id);


--
-- Name: StaffDailyRecord StaffDailyRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StaffDailyRecord"
    ADD CONSTRAINT "StaffDailyRecord_pkey" PRIMARY KEY (id);


--
-- Name: StaffSalaryProfile StaffSalaryProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StaffSalaryProfile"
    ADD CONSTRAINT "StaffSalaryProfile_pkey" PRIMARY KEY (id);


--
-- Name: StaffService StaffService_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StaffService"
    ADD CONSTRAINT "StaffService_pkey" PRIMARY KEY (id);


--
-- Name: StaffShift StaffShift_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StaffShift"
    ADD CONSTRAINT "StaffShift_pkey" PRIMARY KEY (id);


--
-- Name: Staff Staff_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Staff"
    ADD CONSTRAINT "Staff_pkey" PRIMARY KEY (id);


--
-- Name: StockIssueItem StockIssueItem_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StockIssueItem"
    ADD CONSTRAINT "StockIssueItem_pkey" PRIMARY KEY (id);


--
-- Name: StockIssue StockIssue_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StockIssue"
    ADD CONSTRAINT "StockIssue_pkey" PRIMARY KEY (id);


--
-- Name: StockLog StockLog_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StockLog"
    ADD CONSTRAINT "StockLog_pkey" PRIMARY KEY (id);


--
-- Name: StockReceiptItem StockReceiptItem_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StockReceiptItem"
    ADD CONSTRAINT "StockReceiptItem_pkey" PRIMARY KEY (id);


--
-- Name: StockReceipt StockReceipt_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StockReceipt"
    ADD CONSTRAINT "StockReceipt_pkey" PRIMARY KEY (id);


--
-- Name: StockTransaction StockTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StockTransaction"
    ADD CONSTRAINT "StockTransaction_pkey" PRIMARY KEY (id);


--
-- Name: StockTransferItem StockTransferItem_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StockTransferItem"
    ADD CONSTRAINT "StockTransferItem_pkey" PRIMARY KEY (id);


--
-- Name: StockTransfer StockTransfer_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StockTransfer"
    ADD CONSTRAINT "StockTransfer_pkey" PRIMARY KEY (id);


--
-- Name: StyleMatching StyleMatching_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StyleMatching"
    ADD CONSTRAINT "StyleMatching_pkey" PRIMARY KEY (id);


--
-- Name: StylistAnalysis StylistAnalysis_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StylistAnalysis"
    ADD CONSTRAINT "StylistAnalysis_pkey" PRIMARY KEY (id);


--
-- Name: StylistSignatureStyle StylistSignatureStyle_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StylistSignatureStyle"
    ADD CONSTRAINT "StylistSignatureStyle_pkey" PRIMARY KEY (id);


--
-- Name: StylistSupportPanel StylistSupportPanel_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StylistSupportPanel"
    ADD CONSTRAINT "StylistSupportPanel_pkey" PRIMARY KEY (id);


--
-- Name: Supplier Supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Supplier"
    ADD CONSTRAINT "Supplier_pkey" PRIMARY KEY (id);


--
-- Name: TechnicalChecklist TechnicalChecklist_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."TechnicalChecklist"
    ADD CONSTRAINT "TechnicalChecklist_pkey" PRIMARY KEY (id);


--
-- Name: ThresholdRule ThresholdRule_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ThresholdRule"
    ADD CONSTRAINT "ThresholdRule_pkey" PRIMARY KEY (id);


--
-- Name: TierUpgradeHistory TierUpgradeHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."TierUpgradeHistory"
    ADD CONSTRAINT "TierUpgradeHistory_pkey" PRIMARY KEY (id);


--
-- Name: TrainingExercise TrainingExercise_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."TrainingExercise"
    ADD CONSTRAINT "TrainingExercise_pkey" PRIMARY KEY (id);


--
-- Name: TrainingLesson TrainingLesson_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."TrainingLesson"
    ADD CONSTRAINT "TrainingLesson_pkey" PRIMARY KEY (id);


--
-- Name: TrainingLevel TrainingLevel_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."TrainingLevel"
    ADD CONSTRAINT "TrainingLevel_pkey" PRIMARY KEY (id);


--
-- Name: TrainingModule TrainingModule_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."TrainingModule"
    ADD CONSTRAINT "TrainingModule_pkey" PRIMARY KEY (id);


--
-- Name: TrainingProgress TrainingProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."TrainingProgress"
    ADD CONSTRAINT "TrainingProgress_pkey" PRIMARY KEY (id);


--
-- Name: TrainingQuizResult TrainingQuizResult_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."TrainingQuizResult"
    ADD CONSTRAINT "TrainingQuizResult_pkey" PRIMARY KEY (id);


--
-- Name: TrainingQuiz TrainingQuiz_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."TrainingQuiz"
    ADD CONSTRAINT "TrainingQuiz_pkey" PRIMARY KEY (id);


--
-- Name: TrainingRole TrainingRole_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."TrainingRole"
    ADD CONSTRAINT "TrainingRole_pkey" PRIMARY KEY (id);


--
-- Name: TreatmentPlan TreatmentPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."TreatmentPlan"
    ADD CONSTRAINT "TreatmentPlan_pkey" PRIMARY KEY (id);


--
-- Name: TreatmentTracking TreatmentTracking_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."TreatmentTracking"
    ADD CONSTRAINT "TreatmentTracking_pkey" PRIMARY KEY (id);


--
-- Name: UpsaleMatrix UpsaleMatrix_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."UpsaleMatrix"
    ADD CONSTRAINT "UpsaleMatrix_pkey" PRIMARY KEY (id);


--
-- Name: UpsaleRecommendation UpsaleRecommendation_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."UpsaleRecommendation"
    ADD CONSTRAINT "UpsaleRecommendation_pkey" PRIMARY KEY (id);


--
-- Name: UpsaleRecord UpsaleRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."UpsaleRecord"
    ADD CONSTRAINT "UpsaleRecord_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: VideoFrame VideoFrame_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."VideoFrame"
    ADD CONSTRAINT "VideoFrame_pkey" PRIMARY KEY (id);


--
-- Name: Visit Visit_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Visit"
    ADD CONSTRAINT "Visit_pkey" PRIMARY KEY (id);


--
-- Name: VoiceAnalytics VoiceAnalytics_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."VoiceAnalytics"
    ADD CONSTRAINT "VoiceAnalytics_pkey" PRIMARY KEY (id);


--
-- Name: VoiceCommand VoiceCommand_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."VoiceCommand"
    ADD CONSTRAINT "VoiceCommand_pkey" PRIMARY KEY (id);


--
-- Name: VoiceIntent VoiceIntent_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."VoiceIntent"
    ADD CONSTRAINT "VoiceIntent_pkey" PRIMARY KEY (id);


--
-- Name: VoiceInteraction VoiceInteraction_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."VoiceInteraction"
    ADD CONSTRAINT "VoiceInteraction_pkey" PRIMARY KEY (id);


--
-- Name: VoiceSession VoiceSession_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."VoiceSession"
    ADD CONSTRAINT "VoiceSession_pkey" PRIMARY KEY (id);


--
-- Name: WorkflowError WorkflowError_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."WorkflowError"
    ADD CONSTRAINT "WorkflowError_pkey" PRIMARY KEY (id);


--
-- Name: WorkflowRun WorkflowRun_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."WorkflowRun"
    ADD CONSTRAINT "WorkflowRun_pkey" PRIMARY KEY (id);


--
-- Name: AbandonedCart_abandonmentType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "AbandonedCart_abandonmentType_idx" ON public."AbandonedCart" USING btree ("abandonmentType");


--
-- Name: AbandonedCart_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "AbandonedCart_customerId_idx" ON public."AbandonedCart" USING btree ("customerId");


--
-- Name: AbandonedCart_nextAttempt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "AbandonedCart_nextAttempt_idx" ON public."AbandonedCart" USING btree ("nextAttempt");


--
-- Name: AbandonedCart_phone_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "AbandonedCart_phone_idx" ON public."AbandonedCart" USING btree (phone);


--
-- Name: AbandonedCart_status_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "AbandonedCart_status_idx" ON public."AbandonedCart" USING btree (status);


--
-- Name: AutomationFlow_active_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "AutomationFlow_active_idx" ON public."AutomationFlow" USING btree (active);


--
-- Name: AutomationFlow_trigger_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "AutomationFlow_trigger_idx" ON public."AutomationFlow" USING btree (trigger);


--
-- Name: AutomationLog_createdAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "AutomationLog_createdAt_idx" ON public."AutomationLog" USING btree ("createdAt");


--
-- Name: AutomationLog_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "AutomationLog_customerId_idx" ON public."AutomationLog" USING btree ("customerId");


--
-- Name: AutomationLog_flowId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "AutomationLog_flowId_idx" ON public."AutomationLog" USING btree ("flowId");


--
-- Name: BranchForecast_branchId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "BranchForecast_branchId_idx" ON public."BranchForecast" USING btree ("branchId");


--
-- Name: BranchForecast_forecastDate_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "BranchForecast_forecastDate_idx" ON public."BranchForecast" USING btree ("forecastDate");


--
-- Name: BranchForecast_forecastType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "BranchForecast_forecastType_idx" ON public."BranchForecast" USING btree ("forecastType");


--
-- Name: BranchInventory_branchId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "BranchInventory_branchId_idx" ON public."BranchInventory" USING btree ("branchId");


--
-- Name: BranchInventory_branchId_productId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "BranchInventory_branchId_productId_key" ON public."BranchInventory" USING btree ("branchId", "productId");


--
-- Name: BranchInventory_productId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "BranchInventory_productId_idx" ON public."BranchInventory" USING btree ("productId");


--
-- Name: BranchPerformance_branchId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "BranchPerformance_branchId_idx" ON public."BranchPerformance" USING btree ("branchId");


--
-- Name: BranchPerformance_branchId_periodStart_periodType_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "BranchPerformance_branchId_periodStart_periodType_key" ON public."BranchPerformance" USING btree ("branchId", "periodStart", "periodType");


--
-- Name: BranchPerformance_periodStart_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "BranchPerformance_periodStart_idx" ON public."BranchPerformance" USING btree ("periodStart");


--
-- Name: BranchPerformance_periodType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "BranchPerformance_periodType_idx" ON public."BranchPerformance" USING btree ("periodType");


--
-- Name: BranchStaffAssignment_branchId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "BranchStaffAssignment_branchId_idx" ON public."BranchStaffAssignment" USING btree ("branchId");


--
-- Name: BranchStaffAssignment_isActive_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "BranchStaffAssignment_isActive_idx" ON public."BranchStaffAssignment" USING btree ("isActive");


--
-- Name: BranchStaffAssignment_staffId_branchId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "BranchStaffAssignment_staffId_branchId_key" ON public."BranchStaffAssignment" USING btree ("staffId", "branchId");


--
-- Name: BranchStaffAssignment_staffId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "BranchStaffAssignment_staffId_idx" ON public."BranchStaffAssignment" USING btree ("staffId");


--
-- Name: Branch_code_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "Branch_code_key" ON public."Branch" USING btree (code);


--
-- Name: Branch_isActive_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Branch_isActive_idx" ON public."Branch" USING btree ("isActive");


--
-- Name: Branch_name_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Branch_name_idx" ON public."Branch" USING btree (name);


--
-- Name: Branch_partnerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Branch_partnerId_idx" ON public."Branch" USING btree ("partnerId");


--
-- Name: COGSCalculation_branchId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "COGSCalculation_branchId_idx" ON public."COGSCalculation" USING btree ("branchId");


--
-- Name: COGSCalculation_date_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "COGSCalculation_date_idx" ON public."COGSCalculation" USING btree (date);


--
-- Name: COGSCalculation_serviceId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "COGSCalculation_serviceId_idx" ON public."COGSCalculation" USING btree ("serviceId");


--
-- Name: Cashflow_branchId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Cashflow_branchId_idx" ON public."Cashflow" USING btree ("branchId");


--
-- Name: Cashflow_date_branchId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "Cashflow_date_branchId_key" ON public."Cashflow" USING btree (date, "branchId");


--
-- Name: Cashflow_date_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Cashflow_date_idx" ON public."Cashflow" USING btree (date);


--
-- Name: Certification_levelId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Certification_levelId_idx" ON public."Certification" USING btree ("levelId");


--
-- Name: Certification_userId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Certification_userId_idx" ON public."Certification" USING btree ("userId");


--
-- Name: ChemicalHistoryRisk_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ChemicalHistoryRisk_customerId_idx" ON public."ChemicalHistoryRisk" USING btree ("customerId");


--
-- Name: ChemicalHistoryRisk_riskLevel_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ChemicalHistoryRisk_riskLevel_idx" ON public."ChemicalHistoryRisk" USING btree ("riskLevel");


--
-- Name: ColorAnalysis_baseLevel_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ColorAnalysis_baseLevel_idx" ON public."ColorAnalysis" USING btree ("baseLevel");


--
-- Name: ColorAnalysis_imageId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "ColorAnalysis_imageId_key" ON public."ColorAnalysis" USING btree ("imageId");


--
-- Name: ColorAnalysis_technique_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ColorAnalysis_technique_idx" ON public."ColorAnalysis" USING btree (technique);


--
-- Name: ColorRecommendation_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ColorRecommendation_customerId_idx" ON public."ColorRecommendation" USING btree ("customerId");


--
-- Name: ColorRecommendation_recommendedColor_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ColorRecommendation_recommendedColor_idx" ON public."ColorRecommendation" USING btree ("recommendedColor");


--
-- Name: CompetitorAnalysis_analyzedAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CompetitorAnalysis_analyzedAt_idx" ON public."CompetitorAnalysis" USING btree ("analyzedAt");


--
-- Name: CompetitorAnalysis_competitorName_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CompetitorAnalysis_competitorName_idx" ON public."CompetitorAnalysis" USING btree ("competitorName");


--
-- Name: ConsistencyMetrics_periodStart_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ConsistencyMetrics_periodStart_idx" ON public."ConsistencyMetrics" USING btree ("periodStart");


--
-- Name: ConsistencyMetrics_serviceId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ConsistencyMetrics_serviceId_idx" ON public."ConsistencyMetrics" USING btree ("serviceId");


--
-- Name: ConsistencyMetrics_staffId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ConsistencyMetrics_staffId_idx" ON public."ConsistencyMetrics" USING btree ("staffId");


--
-- Name: ConsumptionTracking_date_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ConsumptionTracking_date_idx" ON public."ConsumptionTracking" USING btree (date);


--
-- Name: ConsumptionTracking_productId_date_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "ConsumptionTracking_productId_date_key" ON public."ConsumptionTracking" USING btree ("productId", date);


--
-- Name: ConsumptionTracking_productId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ConsumptionTracking_productId_idx" ON public."ConsumptionTracking" USING btree ("productId");


--
-- Name: ConsumptionTracking_topStaffId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ConsumptionTracking_topStaffId_idx" ON public."ConsumptionTracking" USING btree ("topStaffId");


--
-- Name: CorrectionSuggestion_bookingId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CorrectionSuggestion_bookingId_idx" ON public."CorrectionSuggestion" USING btree ("bookingId");


--
-- Name: CorrectionSuggestion_errorId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CorrectionSuggestion_errorId_idx" ON public."CorrectionSuggestion" USING btree ("errorId");


--
-- Name: CorrectionSuggestion_status_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CorrectionSuggestion_status_idx" ON public."CorrectionSuggestion" USING btree (status);


--
-- Name: CrossBranchQuality_periodStart_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CrossBranchQuality_periodStart_idx" ON public."CrossBranchQuality" USING btree ("periodStart");


--
-- Name: CurlPatternAnalysis_curlPattern_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CurlPatternAnalysis_curlPattern_idx" ON public."CurlPatternAnalysis" USING btree ("curlPattern");


--
-- Name: CurlPatternAnalysis_imageId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "CurlPatternAnalysis_imageId_key" ON public."CurlPatternAnalysis" USING btree ("imageId");


--
-- Name: CustomerBehavior_behaviorType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerBehavior_behaviorType_idx" ON public."CustomerBehavior" USING btree ("behaviorType");


--
-- Name: CustomerBehavior_customerId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "CustomerBehavior_customerId_key" ON public."CustomerBehavior" USING btree ("customerId");


--
-- Name: CustomerBehavior_lifetimeValue_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerBehavior_lifetimeValue_idx" ON public."CustomerBehavior" USING btree ("lifetimeValue");


--
-- Name: CustomerBehavior_totalSpent_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerBehavior_totalSpent_idx" ON public."CustomerBehavior" USING btree ("totalSpent");


--
-- Name: CustomerExperience_createdAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerExperience_createdAt_idx" ON public."CustomerExperience" USING btree ("createdAt");


--
-- Name: CustomerExperience_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerExperience_customerId_idx" ON public."CustomerExperience" USING btree ("customerId");


--
-- Name: CustomerExperience_overallScore_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerExperience_overallScore_idx" ON public."CustomerExperience" USING btree ("overallScore");


--
-- Name: CustomerInsight_churnRisk_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerInsight_churnRisk_idx" ON public."CustomerInsight" USING btree ("churnRisk");


--
-- Name: CustomerInsight_createdAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerInsight_createdAt_idx" ON public."CustomerInsight" USING btree ("createdAt");


--
-- Name: CustomerInsight_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerInsight_customerId_idx" ON public."CustomerInsight" USING btree ("customerId");


--
-- Name: CustomerJourney_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerJourney_customerId_idx" ON public."CustomerJourney" USING btree ("customerId");


--
-- Name: CustomerJourney_journeyStage_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerJourney_journeyStage_idx" ON public."CustomerJourney" USING btree ("journeyStage");


--
-- Name: CustomerJourney_timestamp_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerJourney_timestamp_idx" ON public."CustomerJourney" USING btree ("timestamp");


--
-- Name: CustomerJourney_touchpoint_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerJourney_touchpoint_idx" ON public."CustomerJourney" USING btree (touchpoint);


--
-- Name: CustomerLoyalty_customerId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "CustomerLoyalty_customerId_key" ON public."CustomerLoyalty" USING btree ("customerId");


--
-- Name: CustomerMembership_currentTier_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerMembership_currentTier_idx" ON public."CustomerMembership" USING btree ("currentTier");


--
-- Name: CustomerMembership_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerMembership_customerId_idx" ON public."CustomerMembership" USING btree ("customerId");


--
-- Name: CustomerMembership_customerId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "CustomerMembership_customerId_key" ON public."CustomerMembership" USING btree ("customerId");


--
-- Name: CustomerMembership_status_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerMembership_status_idx" ON public."CustomerMembership" USING btree (status);


--
-- Name: CustomerPersonalityProfile_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerPersonalityProfile_customerId_idx" ON public."CustomerPersonalityProfile" USING btree ("customerId");


--
-- Name: CustomerPersonalityProfile_customerId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "CustomerPersonalityProfile_customerId_key" ON public."CustomerPersonalityProfile" USING btree ("customerId");


--
-- Name: CustomerPersonalityProfile_styleVibe_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerPersonalityProfile_styleVibe_idx" ON public."CustomerPersonalityProfile" USING btree ("styleVibe");


--
-- Name: CustomerPhoto_createdAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerPhoto_createdAt_idx" ON public."CustomerPhoto" USING btree ("createdAt");


--
-- Name: CustomerPhoto_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerPhoto_customerId_idx" ON public."CustomerPhoto" USING btree ("customerId");


--
-- Name: CustomerPrediction_createdAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerPrediction_createdAt_idx" ON public."CustomerPrediction" USING btree ("createdAt");


--
-- Name: CustomerPrediction_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerPrediction_customerId_idx" ON public."CustomerPrediction" USING btree ("customerId");


--
-- Name: CustomerPrediction_customerId_predictionType_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "CustomerPrediction_customerId_predictionType_key" ON public."CustomerPrediction" USING btree ("customerId", "predictionType");


--
-- Name: CustomerPrediction_predictionType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerPrediction_predictionType_idx" ON public."CustomerPrediction" USING btree ("predictionType");


--
-- Name: CustomerPrediction_returnProbability_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerPrediction_returnProbability_idx" ON public."CustomerPrediction" USING btree ("returnProbability");


--
-- Name: CustomerProfile_customerId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "CustomerProfile_customerId_key" ON public."CustomerProfile" USING btree ("customerId");


--
-- Name: CustomerProfile_phone_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "CustomerProfile_phone_key" ON public."CustomerProfile" USING btree (phone);


--
-- Name: CustomerRiskAlert_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerRiskAlert_customerId_idx" ON public."CustomerRiskAlert" USING btree ("customerId");


--
-- Name: CustomerRiskAlert_detectedAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerRiskAlert_detectedAt_idx" ON public."CustomerRiskAlert" USING btree ("detectedAt");


--
-- Name: CustomerRiskAlert_riskType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerRiskAlert_riskType_idx" ON public."CustomerRiskAlert" USING btree ("riskType");


--
-- Name: CustomerRiskAlert_severity_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerRiskAlert_severity_idx" ON public."CustomerRiskAlert" USING btree (severity);


--
-- Name: CustomerRiskAlert_status_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerRiskAlert_status_idx" ON public."CustomerRiskAlert" USING btree (status);


--
-- Name: CustomerStyleHistory_bookingId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerStyleHistory_bookingId_idx" ON public."CustomerStyleHistory" USING btree ("bookingId");


--
-- Name: CustomerStyleHistory_createdAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerStyleHistory_createdAt_idx" ON public."CustomerStyleHistory" USING btree ("createdAt");


--
-- Name: CustomerStyleHistory_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerStyleHistory_customerId_idx" ON public."CustomerStyleHistory" USING btree ("customerId");


--
-- Name: CustomerStyleHistory_styleType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerStyleHistory_styleType_idx" ON public."CustomerStyleHistory" USING btree ("styleType");


--
-- Name: CustomerTag_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerTag_customerId_idx" ON public."CustomerTag" USING btree ("customerId");


--
-- Name: CustomerTag_customerId_tag_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "CustomerTag_customerId_tag_key" ON public."CustomerTag" USING btree ("customerId", tag);


--
-- Name: CustomerTag_tag_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerTag_tag_idx" ON public."CustomerTag" USING btree (tag);


--
-- Name: CustomerTouchpoint_channel_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerTouchpoint_channel_idx" ON public."CustomerTouchpoint" USING btree (channel);


--
-- Name: CustomerTouchpoint_createdAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerTouchpoint_createdAt_idx" ON public."CustomerTouchpoint" USING btree ("createdAt");


--
-- Name: CustomerTouchpoint_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerTouchpoint_customerId_idx" ON public."CustomerTouchpoint" USING btree ("customerId");


--
-- Name: CustomerTouchpoint_type_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "CustomerTouchpoint_type_idx" ON public."CustomerTouchpoint" USING btree (type);


--
-- Name: Customer_phone_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "Customer_phone_key" ON public."Customer" USING btree (phone);


--
-- Name: DailyReport_generatedAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "DailyReport_generatedAt_idx" ON public."DailyReport" USING btree ("generatedAt");


--
-- Name: DailyReport_reportDate_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "DailyReport_reportDate_idx" ON public."DailyReport" USING btree ("reportDate");


--
-- Name: DailyReport_reportDate_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "DailyReport_reportDate_key" ON public."DailyReport" USING btree ("reportDate");


--
-- Name: DamageLevelAssessment_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "DamageLevelAssessment_customerId_idx" ON public."DamageLevelAssessment" USING btree ("customerId");


--
-- Name: DamageLevelAssessment_damageCategory_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "DamageLevelAssessment_damageCategory_idx" ON public."DamageLevelAssessment" USING btree ("damageCategory");


--
-- Name: DamageLevelAssessment_damageLevel_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "DamageLevelAssessment_damageLevel_idx" ON public."DamageLevelAssessment" USING btree ("damageLevel");


--
-- Name: DynamicPricing_branchId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "DynamicPricing_branchId_idx" ON public."DynamicPricing" USING btree ("branchId");


--
-- Name: DynamicPricing_effectiveFrom_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "DynamicPricing_effectiveFrom_idx" ON public."DynamicPricing" USING btree ("effectiveFrom");


--
-- Name: DynamicPricing_serviceId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "DynamicPricing_serviceId_idx" ON public."DynamicPricing" USING btree ("serviceId");


--
-- Name: DynamicPricing_stylistId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "DynamicPricing_stylistId_idx" ON public."DynamicPricing" USING btree ("stylistId");


--
-- Name: ErrorDetection_bookingId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ErrorDetection_bookingId_idx" ON public."ErrorDetection" USING btree ("bookingId");


--
-- Name: ErrorDetection_errorType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ErrorDetection_errorType_idx" ON public."ErrorDetection" USING btree ("errorType");


--
-- Name: ErrorDetection_serviceId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ErrorDetection_serviceId_idx" ON public."ErrorDetection" USING btree ("serviceId");


--
-- Name: ErrorDetection_severity_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ErrorDetection_severity_idx" ON public."ErrorDetection" USING btree (severity);


--
-- Name: ErrorDetection_staffId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ErrorDetection_staffId_idx" ON public."ErrorDetection" USING btree ("staffId");


--
-- Name: ErrorDetection_status_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ErrorDetection_status_idx" ON public."ErrorDetection" USING btree (status);


--
-- Name: ExerciseSubmission_exerciseId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ExerciseSubmission_exerciseId_idx" ON public."ExerciseSubmission" USING btree ("exerciseId");


--
-- Name: ExerciseSubmission_userId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ExerciseSubmission_userId_idx" ON public."ExerciseSubmission" USING btree ("userId");


--
-- Name: Expense_branchId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Expense_branchId_idx" ON public."Expense" USING btree ("branchId");


--
-- Name: Expense_category_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Expense_category_idx" ON public."Expense" USING btree (category);


--
-- Name: Expense_date_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Expense_date_idx" ON public."Expense" USING btree (date);


--
-- Name: Expense_status_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Expense_status_idx" ON public."Expense" USING btree (status);


--
-- Name: FaceAnalysis_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "FaceAnalysis_customerId_idx" ON public."FaceAnalysis" USING btree ("customerId");


--
-- Name: FaceAnalysis_faceShape_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "FaceAnalysis_faceShape_idx" ON public."FaceAnalysis" USING btree ("faceShape");


--
-- Name: FinancialForecast_forecastDate_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "FinancialForecast_forecastDate_idx" ON public."FinancialForecast" USING btree ("forecastDate");


--
-- Name: FinancialForecast_periodStart_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "FinancialForecast_periodStart_idx" ON public."FinancialForecast" USING btree ("periodStart");


--
-- Name: FinancialForecast_periodType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "FinancialForecast_periodType_idx" ON public."FinancialForecast" USING btree ("periodType");


--
-- Name: FinancialMetric_branchId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "FinancialMetric_branchId_idx" ON public."FinancialMetric" USING btree ("branchId");


--
-- Name: FinancialMetric_partnerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "FinancialMetric_partnerId_idx" ON public."FinancialMetric" USING btree ("partnerId");


--
-- Name: FinancialMetric_periodStart_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "FinancialMetric_periodStart_idx" ON public."FinancialMetric" USING btree ("periodStart");


--
-- Name: FinancialMetric_periodType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "FinancialMetric_periodType_idx" ON public."FinancialMetric" USING btree ("periodType");


--
-- Name: FinancialRiskAlert_alertType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "FinancialRiskAlert_alertType_idx" ON public."FinancialRiskAlert" USING btree ("alertType");


--
-- Name: FinancialRiskAlert_createdAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "FinancialRiskAlert_createdAt_idx" ON public."FinancialRiskAlert" USING btree ("createdAt");


--
-- Name: FinancialRiskAlert_severity_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "FinancialRiskAlert_severity_idx" ON public."FinancialRiskAlert" USING btree (severity);


--
-- Name: FinancialRiskAlert_status_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "FinancialRiskAlert_status_idx" ON public."FinancialRiskAlert" USING btree (status);


--
-- Name: HQNotification_partnerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HQNotification_partnerId_idx" ON public."HQNotification" USING btree ("partnerId");


--
-- Name: HQNotification_priority_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HQNotification_priority_idx" ON public."HQNotification" USING btree (priority);


--
-- Name: HQNotification_status_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HQNotification_status_idx" ON public."HQNotification" USING btree (status);


--
-- Name: HQNotification_type_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HQNotification_type_idx" ON public."HQNotification" USING btree (type);


--
-- Name: HairAnalysisVideo_bookingId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairAnalysisVideo_bookingId_idx" ON public."HairAnalysisVideo" USING btree ("bookingId");


--
-- Name: HairAnalysisVideo_branchId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairAnalysisVideo_branchId_idx" ON public."HairAnalysisVideo" USING btree ("branchId");


--
-- Name: HairAnalysisVideo_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairAnalysisVideo_customerId_idx" ON public."HairAnalysisVideo" USING btree ("customerId");


--
-- Name: HairAnalysisVideo_staffId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairAnalysisVideo_staffId_idx" ON public."HairAnalysisVideo" USING btree ("staffId");


--
-- Name: HairAnalysisVideo_videoType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairAnalysisVideo_videoType_idx" ON public."HairAnalysisVideo" USING btree ("videoType");


--
-- Name: HairConditionAnalysis_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairConditionAnalysis_customerId_idx" ON public."HairConditionAnalysis" USING btree ("customerId");


--
-- Name: HairConditionAnalysis_damageLevel_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairConditionAnalysis_damageLevel_idx" ON public."HairConditionAnalysis" USING btree ("damageLevel");


--
-- Name: HairConditionAnalysis_riskLevel_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairConditionAnalysis_riskLevel_idx" ON public."HairConditionAnalysis" USING btree ("riskLevel");


--
-- Name: HairDamageMapping_damageLevel_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairDamageMapping_damageLevel_idx" ON public."HairDamageMapping" USING btree ("damageLevel");


--
-- Name: HairDamageMapping_overallDamage_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairDamageMapping_overallDamage_idx" ON public."HairDamageMapping" USING btree ("overallDamage");


--
-- Name: HairDamageMapping_videoId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "HairDamageMapping_videoId_key" ON public."HairDamageMapping" USING btree ("videoId");


--
-- Name: HairElasticityAnalysis_damageRisk_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairElasticityAnalysis_damageRisk_idx" ON public."HairElasticityAnalysis" USING btree ("damageRisk");


--
-- Name: HairElasticityAnalysis_elasticityScore_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairElasticityAnalysis_elasticityScore_idx" ON public."HairElasticityAnalysis" USING btree ("elasticityScore");


--
-- Name: HairElasticityAnalysis_videoId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "HairElasticityAnalysis_videoId_key" ON public."HairElasticityAnalysis" USING btree ("videoId");


--
-- Name: HairFormula_formulaType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairFormula_formulaType_idx" ON public."HairFormula" USING btree ("formulaType");


--
-- Name: HairFormula_imageId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairFormula_imageId_idx" ON public."HairFormula" USING btree ("imageId");


--
-- Name: HairFormula_riskLevel_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairFormula_riskLevel_idx" ON public."HairFormula" USING btree ("riskLevel");


--
-- Name: HairHealthScan_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairHealthScan_customerId_idx" ON public."HairHealthScan" USING btree ("customerId");


--
-- Name: HairHealthScan_healthScore_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairHealthScan_healthScore_idx" ON public."HairHealthScan" USING btree ("healthScore");


--
-- Name: HairMovementAnalysis_bounceScore_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairMovementAnalysis_bounceScore_idx" ON public."HairMovementAnalysis" USING btree ("bounceScore");


--
-- Name: HairMovementAnalysis_movementScore_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairMovementAnalysis_movementScore_idx" ON public."HairMovementAnalysis" USING btree ("movementScore");


--
-- Name: HairMovementAnalysis_videoId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "HairMovementAnalysis_videoId_key" ON public."HairMovementAnalysis" USING btree ("videoId");


--
-- Name: HairProcedure_imageId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairProcedure_imageId_idx" ON public."HairProcedure" USING btree ("imageId");


--
-- Name: HairProcedure_procedureType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairProcedure_procedureType_idx" ON public."HairProcedure" USING btree ("procedureType");


--
-- Name: HairSimulation_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairSimulation_customerId_idx" ON public."HairSimulation" USING btree ("customerId");


--
-- Name: HairSimulation_status_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairSimulation_status_idx" ON public."HairSimulation" USING btree (status);


--
-- Name: HairStyleAnalysis_colorLevel_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairStyleAnalysis_colorLevel_idx" ON public."HairStyleAnalysis" USING btree ("colorLevel");


--
-- Name: HairStyleAnalysis_imageId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "HairStyleAnalysis_imageId_key" ON public."HairStyleAnalysis" USING btree ("imageId");


--
-- Name: HairStyleAnalysis_styleType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairStyleAnalysis_styleType_idx" ON public."HairStyleAnalysis" USING btree ("styleType");


--
-- Name: HairStyleImage_branchId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairStyleImage_branchId_idx" ON public."HairStyleImage" USING btree ("branchId");


--
-- Name: HairStyleImage_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairStyleImage_customerId_idx" ON public."HairStyleImage" USING btree ("customerId");


--
-- Name: HairStyleImage_imageType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairStyleImage_imageType_idx" ON public."HairStyleImage" USING btree ("imageType");


--
-- Name: HairStyleImage_partnerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairStyleImage_partnerId_idx" ON public."HairStyleImage" USING btree ("partnerId");


--
-- Name: HairStyleImage_staffId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairStyleImage_staffId_idx" ON public."HairStyleImage" USING btree ("staffId");


--
-- Name: HairSurfaceAnalysis_drynessLevel_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairSurfaceAnalysis_drynessLevel_idx" ON public."HairSurfaceAnalysis" USING btree ("drynessLevel");


--
-- Name: HairSurfaceAnalysis_porosityLevel_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairSurfaceAnalysis_porosityLevel_idx" ON public."HairSurfaceAnalysis" USING btree ("porosityLevel");


--
-- Name: HairSurfaceAnalysis_shineLevel_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairSurfaceAnalysis_shineLevel_idx" ON public."HairSurfaceAnalysis" USING btree ("shineLevel");


--
-- Name: HairSurfaceAnalysis_videoId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "HairSurfaceAnalysis_videoId_key" ON public."HairSurfaceAnalysis" USING btree ("videoId");


--
-- Name: HairVideoRecommendation_hairHealthScore_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairVideoRecommendation_hairHealthScore_idx" ON public."HairVideoRecommendation" USING btree ("hairHealthScore");


--
-- Name: HairVideoRecommendation_healthStatus_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairVideoRecommendation_healthStatus_idx" ON public."HairVideoRecommendation" USING btree ("healthStatus");


--
-- Name: HairVideoRecommendation_overallRisk_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairVideoRecommendation_overallRisk_idx" ON public."HairVideoRecommendation" USING btree ("overallRisk");


--
-- Name: HairVideoRecommendation_videoId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "HairVideoRecommendation_videoId_key" ON public."HairVideoRecommendation" USING btree ("videoId");


--
-- Name: HairstyleRecommendation_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairstyleRecommendation_customerId_idx" ON public."HairstyleRecommendation" USING btree ("customerId");


--
-- Name: HairstyleRecommendation_recommendedStyle_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "HairstyleRecommendation_recommendedStyle_idx" ON public."HairstyleRecommendation" USING btree ("recommendedStyle");


--
-- Name: InventoryProjection_needsRestock_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "InventoryProjection_needsRestock_idx" ON public."InventoryProjection" USING btree ("needsRestock");


--
-- Name: InventoryProjection_productId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "InventoryProjection_productId_idx" ON public."InventoryProjection" USING btree ("productId");


--
-- Name: InventoryProjection_productId_projectionDate_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "InventoryProjection_productId_projectionDate_key" ON public."InventoryProjection" USING btree ("productId", "projectionDate");


--
-- Name: InventoryProjection_projectionDate_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "InventoryProjection_projectionDate_idx" ON public."InventoryProjection" USING btree ("projectionDate");


--
-- Name: InventoryProjection_restockPriority_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "InventoryProjection_restockPriority_idx" ON public."InventoryProjection" USING btree ("restockPriority");


--
-- Name: Invoice_bookingId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "Invoice_bookingId_key" ON public."Invoice" USING btree ("bookingId");


--
-- Name: License_endDate_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "License_endDate_idx" ON public."License" USING btree ("endDate");


--
-- Name: License_partnerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "License_partnerId_idx" ON public."License" USING btree ("partnerId");


--
-- Name: License_plan_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "License_plan_idx" ON public."License" USING btree (plan);


--
-- Name: License_status_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "License_status_idx" ON public."License" USING btree (status);


--
-- Name: Location_branchId_code_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "Location_branchId_code_key" ON public."Location" USING btree ("branchId", code);


--
-- Name: Location_branchId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Location_branchId_idx" ON public."Location" USING btree ("branchId");


--
-- Name: Location_code_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Location_code_idx" ON public."Location" USING btree (code);


--
-- Name: LossAlert_detectedAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "LossAlert_detectedAt_idx" ON public."LossAlert" USING btree ("detectedAt");


--
-- Name: LossAlert_productId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "LossAlert_productId_idx" ON public."LossAlert" USING btree ("productId");


--
-- Name: LossAlert_severity_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "LossAlert_severity_idx" ON public."LossAlert" USING btree (severity);


--
-- Name: LossAlert_staffId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "LossAlert_staffId_idx" ON public."LossAlert" USING btree ("staffId");


--
-- Name: LossAlert_status_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "LossAlert_status_idx" ON public."LossAlert" USING btree (status);


--
-- Name: LossAlert_type_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "LossAlert_type_idx" ON public."LossAlert" USING btree (type);


--
-- Name: LoyaltyPrediction_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "LoyaltyPrediction_customerId_idx" ON public."LoyaltyPrediction" USING btree ("customerId");


--
-- Name: LoyaltyPrediction_predictionType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "LoyaltyPrediction_predictionType_idx" ON public."LoyaltyPrediction" USING btree ("predictionType");


--
-- Name: LoyaltyPrediction_score_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "LoyaltyPrediction_score_idx" ON public."LoyaltyPrediction" USING btree (score);


--
-- Name: LoyaltyPrediction_status_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "LoyaltyPrediction_status_idx" ON public."LoyaltyPrediction" USING btree (status);


--
-- Name: MarketingAutomation_campaignId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MarketingAutomation_campaignId_idx" ON public."MarketingAutomation" USING btree ("campaignId");


--
-- Name: MarketingAutomation_isActive_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MarketingAutomation_isActive_idx" ON public."MarketingAutomation" USING btree ("isActive");


--
-- Name: MarketingAutomation_triggerType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MarketingAutomation_triggerType_idx" ON public."MarketingAutomation" USING btree ("triggerType");


--
-- Name: MarketingChannel_name_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "MarketingChannel_name_key" ON public."MarketingChannel" USING btree (name);


--
-- Name: MarketingChannel_type_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MarketingChannel_type_idx" ON public."MarketingChannel" USING btree (type);


--
-- Name: MarketingContent_campaignId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MarketingContent_campaignId_idx" ON public."MarketingContent" USING btree ("campaignId");


--
-- Name: MarketingContent_contentType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MarketingContent_contentType_idx" ON public."MarketingContent" USING btree ("contentType");


--
-- Name: MarketingContent_platform_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MarketingContent_platform_idx" ON public."MarketingContent" USING btree (platform);


--
-- Name: MarketingContent_scheduledDate_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MarketingContent_scheduledDate_idx" ON public."MarketingContent" USING btree ("scheduledDate");


--
-- Name: MarketingDataPoint_channelId_date_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "MarketingDataPoint_channelId_date_key" ON public."MarketingDataPoint" USING btree ("channelId", date);


--
-- Name: MarketingDataPoint_channelId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MarketingDataPoint_channelId_idx" ON public."MarketingDataPoint" USING btree ("channelId");


--
-- Name: MarketingDataPoint_date_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MarketingDataPoint_date_idx" ON public."MarketingDataPoint" USING btree (date);


--
-- Name: MarketingSegment_name_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MarketingSegment_name_idx" ON public."MarketingSegment" USING btree (name);


--
-- Name: MarketingSegment_name_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "MarketingSegment_name_key" ON public."MarketingSegment" USING btree (name);


--
-- Name: MarketingTrend_detectedAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MarketingTrend_detectedAt_idx" ON public."MarketingTrend" USING btree ("detectedAt");


--
-- Name: MarketingTrend_trendType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MarketingTrend_trendType_idx" ON public."MarketingTrend" USING btree ("trendType");


--
-- Name: MembershipMetric_periodStart_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MembershipMetric_periodStart_idx" ON public."MembershipMetric" USING btree ("periodStart");


--
-- Name: MembershipMetric_periodType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MembershipMetric_periodType_idx" ON public."MembershipMetric" USING btree ("periodType");


--
-- Name: MembershipMetric_tier_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MembershipMetric_tier_idx" ON public."MembershipMetric" USING btree (tier);


--
-- Name: MembershipTier_tierLevel_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MembershipTier_tierLevel_idx" ON public."MembershipTier" USING btree ("tierLevel");


--
-- Name: MembershipTier_tierLevel_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "MembershipTier_tierLevel_key" ON public."MembershipTier" USING btree ("tierLevel");


--
-- Name: MembershipTier_tierOrder_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MembershipTier_tierOrder_idx" ON public."MembershipTier" USING btree ("tierOrder");


--
-- Name: MinaMemory_category_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MinaMemory_category_idx" ON public."MinaMemory" USING btree (category);


--
-- Name: MinaMemory_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MinaMemory_customerId_idx" ON public."MinaMemory" USING btree ("customerId");


--
-- Name: MinaMemory_key_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MinaMemory_key_idx" ON public."MinaMemory" USING btree (key);


--
-- Name: MinaMemory_lastUsed_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MinaMemory_lastUsed_idx" ON public."MinaMemory" USING btree ("lastUsed");


--
-- Name: MinaMemory_memoryType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MinaMemory_memoryType_idx" ON public."MinaMemory" USING btree ("memoryType");


--
-- Name: MixLog_createdAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MixLog_createdAt_idx" ON public."MixLog" USING btree ("createdAt");


--
-- Name: MixLog_productId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MixLog_productId_idx" ON public."MixLog" USING btree ("productId");


--
-- Name: MixLog_serviceId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MixLog_serviceId_idx" ON public."MixLog" USING btree ("serviceId");


--
-- Name: MixLog_staffId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MixLog_staffId_idx" ON public."MixLog" USING btree ("staffId");


--
-- Name: MixLog_visitId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MixLog_visitId_idx" ON public."MixLog" USING btree ("visitId");


--
-- Name: MonthlyReport_generatedAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MonthlyReport_generatedAt_idx" ON public."MonthlyReport" USING btree ("generatedAt");


--
-- Name: MonthlyReport_reportMonth_reportYear_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "MonthlyReport_reportMonth_reportYear_key" ON public."MonthlyReport" USING btree ("reportMonth", "reportYear");


--
-- Name: MonthlyReport_reportYear_reportMonth_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "MonthlyReport_reportYear_reportMonth_idx" ON public."MonthlyReport" USING btree ("reportYear", "reportMonth");


--
-- Name: PartnerPerformance_partnerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PartnerPerformance_partnerId_idx" ON public."PartnerPerformance" USING btree ("partnerId");


--
-- Name: PartnerPerformance_partnerId_periodStart_periodType_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "PartnerPerformance_partnerId_periodStart_periodType_key" ON public."PartnerPerformance" USING btree ("partnerId", "periodStart", "periodType");


--
-- Name: PartnerPerformance_periodStart_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PartnerPerformance_periodStart_idx" ON public."PartnerPerformance" USING btree ("periodStart");


--
-- Name: PartnerPerformance_periodType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PartnerPerformance_periodType_idx" ON public."PartnerPerformance" USING btree ("periodType");


--
-- Name: PartnerQualityScore_overallScore_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PartnerQualityScore_overallScore_idx" ON public."PartnerQualityScore" USING btree ("overallScore");


--
-- Name: PartnerQualityScore_partnerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PartnerQualityScore_partnerId_idx" ON public."PartnerQualityScore" USING btree ("partnerId");


--
-- Name: PartnerQualityScore_periodStart_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PartnerQualityScore_periodStart_idx" ON public."PartnerQualityScore" USING btree ("periodStart");


--
-- Name: Partner_isActive_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Partner_isActive_idx" ON public."Partner" USING btree ("isActive");


--
-- Name: Partner_licenseStatus_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Partner_licenseStatus_idx" ON public."Partner" USING btree ("licenseStatus");


--
-- Name: Partner_plan_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Partner_plan_idx" ON public."Partner" USING btree (plan);


--
-- Name: Partner_salonName_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Partner_salonName_idx" ON public."Partner" USING btree ("salonName");


--
-- Name: PeakHourDetection_branchId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PeakHourDetection_branchId_idx" ON public."PeakHourDetection" USING btree ("branchId");


--
-- Name: PeakHourDetection_date_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PeakHourDetection_date_idx" ON public."PeakHourDetection" USING btree (date);


--
-- Name: PeakHourDetection_timeSlot_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PeakHourDetection_timeSlot_idx" ON public."PeakHourDetection" USING btree ("timeSlot");


--
-- Name: PeakHourDetection_trafficLevel_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PeakHourDetection_trafficLevel_idx" ON public."PeakHourDetection" USING btree ("trafficLevel");


--
-- Name: PersonalizationMetric_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PersonalizationMetric_customerId_idx" ON public."PersonalizationMetric" USING btree ("customerId");


--
-- Name: PersonalizationMetric_periodStart_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PersonalizationMetric_periodStart_idx" ON public."PersonalizationMetric" USING btree ("periodStart");


--
-- Name: PersonalizationMetric_periodType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PersonalizationMetric_periodType_idx" ON public."PersonalizationMetric" USING btree ("periodType");


--
-- Name: PersonalizedFollowUp_bookingId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PersonalizedFollowUp_bookingId_idx" ON public."PersonalizedFollowUp" USING btree ("bookingId");


--
-- Name: PersonalizedFollowUp_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PersonalizedFollowUp_customerId_idx" ON public."PersonalizedFollowUp" USING btree ("customerId");


--
-- Name: PersonalizedFollowUp_followUpType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PersonalizedFollowUp_followUpType_idx" ON public."PersonalizedFollowUp" USING btree ("followUpType");


--
-- Name: PersonalizedFollowUp_scheduledAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PersonalizedFollowUp_scheduledAt_idx" ON public."PersonalizedFollowUp" USING btree ("scheduledAt");


--
-- Name: PersonalizedFollowUp_status_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PersonalizedFollowUp_status_idx" ON public."PersonalizedFollowUp" USING btree (status);


--
-- Name: PersonalizedRecommendation_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PersonalizedRecommendation_customerId_idx" ON public."PersonalizedRecommendation" USING btree ("customerId");


--
-- Name: PersonalizedRecommendation_priority_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PersonalizedRecommendation_priority_idx" ON public."PersonalizedRecommendation" USING btree (priority);


--
-- Name: PersonalizedRecommendation_recommendationType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PersonalizedRecommendation_recommendationType_idx" ON public."PersonalizedRecommendation" USING btree ("recommendationType");


--
-- Name: PersonalizedRecommendation_status_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PersonalizedRecommendation_status_idx" ON public."PersonalizedRecommendation" USING btree (status);


--
-- Name: PersonalizedRecommendation_stylistId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PersonalizedRecommendation_stylistId_idx" ON public."PersonalizedRecommendation" USING btree ("stylistId");


--
-- Name: PointsTransaction_createdAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PointsTransaction_createdAt_idx" ON public."PointsTransaction" USING btree ("createdAt");


--
-- Name: PointsTransaction_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PointsTransaction_customerId_idx" ON public."PointsTransaction" USING btree ("customerId");


--
-- Name: PointsTransaction_membershipId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PointsTransaction_membershipId_idx" ON public."PointsTransaction" USING btree ("membershipId");


--
-- Name: PointsTransaction_transactionType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PointsTransaction_transactionType_idx" ON public."PointsTransaction" USING btree ("transactionType");


--
-- Name: PorosityElasticityAnalysis_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PorosityElasticityAnalysis_customerId_idx" ON public."PorosityElasticityAnalysis" USING btree ("customerId");


--
-- Name: PorosityElasticityAnalysis_elasticity_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PorosityElasticityAnalysis_elasticity_idx" ON public."PorosityElasticityAnalysis" USING btree (elasticity);


--
-- Name: PorosityElasticityAnalysis_porosity_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PorosityElasticityAnalysis_porosity_idx" ON public."PorosityElasticityAnalysis" USING btree (porosity);


--
-- Name: PostServiceAudit_auditScore_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PostServiceAudit_auditScore_idx" ON public."PostServiceAudit" USING btree ("auditScore");


--
-- Name: PostServiceAudit_auditedAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PostServiceAudit_auditedAt_idx" ON public."PostServiceAudit" USING btree ("auditedAt");


--
-- Name: PostServiceAudit_bookingId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PostServiceAudit_bookingId_idx" ON public."PostServiceAudit" USING btree ("bookingId");


--
-- Name: PostServiceAudit_serviceId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PostServiceAudit_serviceId_idx" ON public."PostServiceAudit" USING btree ("serviceId");


--
-- Name: PostServiceAudit_staffId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PostServiceAudit_staffId_idx" ON public."PostServiceAudit" USING btree ("staffId");


--
-- Name: PricingHistory_branchId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PricingHistory_branchId_idx" ON public."PricingHistory" USING btree ("branchId");


--
-- Name: PricingHistory_changedAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PricingHistory_changedAt_idx" ON public."PricingHistory" USING btree ("changedAt");


--
-- Name: PricingHistory_serviceId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PricingHistory_serviceId_idx" ON public."PricingHistory" USING btree ("serviceId");


--
-- Name: PricingOptimization_branchId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PricingOptimization_branchId_idx" ON public."PricingOptimization" USING btree ("branchId");


--
-- Name: PricingOptimization_periodStart_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PricingOptimization_periodStart_idx" ON public."PricingOptimization" USING btree ("periodStart");


--
-- Name: PricingOptimization_serviceId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PricingOptimization_serviceId_idx" ON public."PricingOptimization" USING btree ("serviceId");


--
-- Name: PricingRule_isActive_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PricingRule_isActive_idx" ON public."PricingRule" USING btree ("isActive");


--
-- Name: PricingRule_priority_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PricingRule_priority_idx" ON public."PricingRule" USING btree (priority);


--
-- Name: PricingRule_ruleType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "PricingRule_ruleType_idx" ON public."PricingRule" USING btree ("ruleType");


--
-- Name: ProductCategory_name_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "ProductCategory_name_key" ON public."ProductCategory" USING btree (name);


--
-- Name: ProductStock_locationId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ProductStock_locationId_idx" ON public."ProductStock" USING btree ("locationId");


--
-- Name: Product_category_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Product_category_idx" ON public."Product" USING btree (category);


--
-- Name: Product_isActive_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Product_isActive_idx" ON public."Product" USING btree ("isActive");


--
-- Name: Product_name_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Product_name_idx" ON public."Product" USING btree (name);


--
-- Name: Product_sku_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Product_sku_idx" ON public."Product" USING btree (sku);


--
-- Name: Product_sku_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "Product_sku_key" ON public."Product" USING btree (sku);


--
-- Name: Product_supplierId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Product_supplierId_idx" ON public."Product" USING btree ("supplierId");


--
-- Name: ProfitCalculation_branchId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ProfitCalculation_branchId_idx" ON public."ProfitCalculation" USING btree ("branchId");


--
-- Name: ProfitCalculation_partnerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ProfitCalculation_partnerId_idx" ON public."ProfitCalculation" USING btree ("partnerId");


--
-- Name: ProfitCalculation_periodStart_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ProfitCalculation_periodStart_idx" ON public."ProfitCalculation" USING btree ("periodStart");


--
-- Name: ProfitCalculation_periodType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ProfitCalculation_periodType_idx" ON public."ProfitCalculation" USING btree ("periodType");


--
-- Name: QualityScore_bookingId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "QualityScore_bookingId_idx" ON public."QualityScore" USING btree ("bookingId");


--
-- Name: QualityScore_capturedAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "QualityScore_capturedAt_idx" ON public."QualityScore" USING btree ("capturedAt");


--
-- Name: QualityScore_overallScore_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "QualityScore_overallScore_idx" ON public."QualityScore" USING btree ("overallScore");


--
-- Name: QualityScore_serviceId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "QualityScore_serviceId_idx" ON public."QualityScore" USING btree ("serviceId");


--
-- Name: QualityScore_staffId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "QualityScore_staffId_idx" ON public."QualityScore" USING btree ("staffId");


--
-- Name: Reminder_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Reminder_customerId_idx" ON public."Reminder" USING btree ("customerId");


--
-- Name: Reminder_sendAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Reminder_sendAt_idx" ON public."Reminder" USING btree ("sendAt");


--
-- Name: Reminder_sent_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Reminder_sent_idx" ON public."Reminder" USING btree (sent);


--
-- Name: Reminder_type_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Reminder_type_idx" ON public."Reminder" USING btree (type);


--
-- Name: RestockRecommendation_createdAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "RestockRecommendation_createdAt_idx" ON public."RestockRecommendation" USING btree ("createdAt");


--
-- Name: RestockRecommendation_priority_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "RestockRecommendation_priority_idx" ON public."RestockRecommendation" USING btree (priority);


--
-- Name: RestockRecommendation_productId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "RestockRecommendation_productId_idx" ON public."RestockRecommendation" USING btree ("productId");


--
-- Name: RestockRecommendation_status_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "RestockRecommendation_status_idx" ON public."RestockRecommendation" USING btree (status);


--
-- Name: RestockTrigger_createdAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "RestockTrigger_createdAt_idx" ON public."RestockTrigger" USING btree ("createdAt");


--
-- Name: RestockTrigger_productId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "RestockTrigger_productId_idx" ON public."RestockTrigger" USING btree ("productId");


--
-- Name: RestockTrigger_severity_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "RestockTrigger_severity_idx" ON public."RestockTrigger" USING btree (severity);


--
-- Name: RestockTrigger_status_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "RestockTrigger_status_idx" ON public."RestockTrigger" USING btree (status);


--
-- Name: RestockTrigger_triggerType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "RestockTrigger_triggerType_idx" ON public."RestockTrigger" USING btree ("triggerType");


--
-- Name: Revenue_branchId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Revenue_branchId_idx" ON public."Revenue" USING btree ("branchId");


--
-- Name: Revenue_date_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Revenue_date_idx" ON public."Revenue" USING btree (date);


--
-- Name: Revenue_partnerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Revenue_partnerId_idx" ON public."Revenue" USING btree ("partnerId");


--
-- Name: Revenue_source_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Revenue_source_idx" ON public."Revenue" USING btree (source);


--
-- Name: Revenue_staffId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Revenue_staffId_idx" ON public."Revenue" USING btree ("staffId");


--
-- Name: RewardCatalog_isActive_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "RewardCatalog_isActive_idx" ON public."RewardCatalog" USING btree ("isActive");


--
-- Name: RewardCatalog_pointsRequired_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "RewardCatalog_pointsRequired_idx" ON public."RewardCatalog" USING btree ("pointsRequired");


--
-- Name: RewardCatalog_rewardType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "RewardCatalog_rewardType_idx" ON public."RewardCatalog" USING btree ("rewardType");


--
-- Name: RewardRedemption_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "RewardRedemption_customerId_idx" ON public."RewardRedemption" USING btree ("customerId");


--
-- Name: RewardRedemption_membershipId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "RewardRedemption_membershipId_idx" ON public."RewardRedemption" USING btree ("membershipId");


--
-- Name: RewardRedemption_rewardId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "RewardRedemption_rewardId_idx" ON public."RewardRedemption" USING btree ("rewardId");


--
-- Name: RewardRedemption_status_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "RewardRedemption_status_idx" ON public."RewardRedemption" USING btree (status);


--
-- Name: RoleplaySession_role_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "RoleplaySession_role_idx" ON public."RoleplaySession" USING btree (role);


--
-- Name: RoleplaySession_userId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "RoleplaySession_userId_idx" ON public."RoleplaySession" USING btree ("userId");


--
-- Name: SOPEnforcement_branchId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "SOPEnforcement_branchId_idx" ON public."SOPEnforcement" USING btree ("branchId");


--
-- Name: SOPEnforcement_partnerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "SOPEnforcement_partnerId_idx" ON public."SOPEnforcement" USING btree ("partnerId");


--
-- Name: SOPEnforcement_status_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "SOPEnforcement_status_idx" ON public."SOPEnforcement" USING btree (status);


--
-- Name: SalesFunnel_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "SalesFunnel_customerId_idx" ON public."SalesFunnel" USING btree ("customerId");


--
-- Name: SalesFunnel_funnelStage_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "SalesFunnel_funnelStage_idx" ON public."SalesFunnel" USING btree ("funnelStage");


--
-- Name: SalesFunnel_nextActionDate_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "SalesFunnel_nextActionDate_idx" ON public."SalesFunnel" USING btree ("nextActionDate");


--
-- Name: ScalpConditionAnalysis_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ScalpConditionAnalysis_customerId_idx" ON public."ScalpConditionAnalysis" USING btree ("customerId");


--
-- Name: ScalpConditionAnalysis_scalpType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ScalpConditionAnalysis_scalpType_idx" ON public."ScalpConditionAnalysis" USING btree ("scalpType");


--
-- Name: ServiceCost_createdAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ServiceCost_createdAt_idx" ON public."ServiceCost" USING btree ("createdAt");


--
-- Name: ServiceCost_invoiceId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ServiceCost_invoiceId_idx" ON public."ServiceCost" USING btree ("invoiceId");


--
-- Name: ServiceCost_productId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ServiceCost_productId_idx" ON public."ServiceCost" USING btree ("productId");


--
-- Name: ServiceCost_serviceId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ServiceCost_serviceId_idx" ON public."ServiceCost" USING btree ("serviceId");


--
-- Name: ServiceCost_visitId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ServiceCost_visitId_idx" ON public."ServiceCost" USING btree ("visitId");


--
-- Name: ServiceSOP_isActive_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ServiceSOP_isActive_idx" ON public."ServiceSOP" USING btree ("isActive");


--
-- Name: ServiceSOP_serviceId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ServiceSOP_serviceId_idx" ON public."ServiceSOP" USING btree ("serviceId");


--
-- Name: ServiceSOP_serviceName_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ServiceSOP_serviceName_idx" ON public."ServiceSOP" USING btree ("serviceName");


--
-- Name: Service_category_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Service_category_idx" ON public."Service" USING btree (category);


--
-- Name: Service_code_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Service_code_idx" ON public."Service" USING btree (code);


--
-- Name: SkillAssessment_createdAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "SkillAssessment_createdAt_idx" ON public."SkillAssessment" USING btree ("createdAt");


--
-- Name: SkillAssessment_level_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "SkillAssessment_level_idx" ON public."SkillAssessment" USING btree (level);


--
-- Name: SkillAssessment_source_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "SkillAssessment_source_idx" ON public."SkillAssessment" USING btree (source);


--
-- Name: SkillAssessment_staffId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "SkillAssessment_staffId_idx" ON public."SkillAssessment" USING btree ("staffId");


--
-- Name: SkillAssessment_totalScore_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "SkillAssessment_totalScore_idx" ON public."SkillAssessment" USING btree ("totalScore");


--
-- Name: SkillProgress_skill_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "SkillProgress_skill_idx" ON public."SkillProgress" USING btree (skill);


--
-- Name: SkillProgress_userId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "SkillProgress_userId_idx" ON public."SkillProgress" USING btree ("userId");


--
-- Name: SmartDiscount_discountType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "SmartDiscount_discountType_idx" ON public."SmartDiscount" USING btree ("discountType");


--
-- Name: SmartDiscount_endTime_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "SmartDiscount_endTime_idx" ON public."SmartDiscount" USING btree ("endTime");


--
-- Name: SmartDiscount_isActive_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "SmartDiscount_isActive_idx" ON public."SmartDiscount" USING btree ("isActive");


--
-- Name: SmartDiscount_startTime_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "SmartDiscount_startTime_idx" ON public."SmartDiscount" USING btree ("startTime");


--
-- Name: StaffService_serviceId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StaffService_serviceId_idx" ON public."StaffService" USING btree ("serviceId");


--
-- Name: StaffService_staffId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StaffService_staffId_idx" ON public."StaffService" USING btree ("staffId");


--
-- Name: StaffService_staffId_serviceId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "StaffService_staffId_serviceId_key" ON public."StaffService" USING btree ("staffId", "serviceId");


--
-- Name: StaffShift_date_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StaffShift_date_idx" ON public."StaffShift" USING btree (date);


--
-- Name: StaffShift_staffId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StaffShift_staffId_idx" ON public."StaffShift" USING btree ("staffId");


--
-- Name: Staff_employeeId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Staff_employeeId_idx" ON public."Staff" USING btree ("employeeId");


--
-- Name: Staff_employeeId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "Staff_employeeId_key" ON public."Staff" USING btree ("employeeId");


--
-- Name: Staff_isActive_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Staff_isActive_idx" ON public."Staff" USING btree ("isActive");


--
-- Name: Staff_position_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Staff_position_idx" ON public."Staff" USING btree ("position");


--
-- Name: Staff_userId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Staff_userId_idx" ON public."Staff" USING btree ("userId");


--
-- Name: Staff_userId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "Staff_userId_key" ON public."Staff" USING btree ("userId");


--
-- Name: StockIssueItem_issueId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockIssueItem_issueId_idx" ON public."StockIssueItem" USING btree ("issueId");


--
-- Name: StockIssueItem_productId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockIssueItem_productId_idx" ON public."StockIssueItem" USING btree ("productId");


--
-- Name: StockIssue_branchId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockIssue_branchId_idx" ON public."StockIssue" USING btree ("branchId");


--
-- Name: StockIssue_date_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockIssue_date_idx" ON public."StockIssue" USING btree (date);


--
-- Name: StockIssue_issueNumber_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockIssue_issueNumber_idx" ON public."StockIssue" USING btree ("issueNumber");


--
-- Name: StockIssue_issueNumber_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "StockIssue_issueNumber_key" ON public."StockIssue" USING btree ("issueNumber");


--
-- Name: StockIssue_reason_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockIssue_reason_idx" ON public."StockIssue" USING btree (reason);


--
-- Name: StockIssue_recipientId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockIssue_recipientId_idx" ON public."StockIssue" USING btree ("recipientId");


--
-- Name: StockIssue_staffId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockIssue_staffId_idx" ON public."StockIssue" USING btree ("staffId");


--
-- Name: StockIssue_status_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockIssue_status_idx" ON public."StockIssue" USING btree (status);


--
-- Name: StockLog_createdAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockLog_createdAt_idx" ON public."StockLog" USING btree ("createdAt");


--
-- Name: StockLog_createdBy_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockLog_createdBy_idx" ON public."StockLog" USING btree ("createdBy");


--
-- Name: StockLog_productId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockLog_productId_idx" ON public."StockLog" USING btree ("productId");


--
-- Name: StockLog_type_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockLog_type_idx" ON public."StockLog" USING btree (type);


--
-- Name: StockReceiptItem_productId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockReceiptItem_productId_idx" ON public."StockReceiptItem" USING btree ("productId");


--
-- Name: StockReceiptItem_receiptId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockReceiptItem_receiptId_idx" ON public."StockReceiptItem" USING btree ("receiptId");


--
-- Name: StockReceipt_branchId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockReceipt_branchId_idx" ON public."StockReceipt" USING btree ("branchId");


--
-- Name: StockReceipt_date_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockReceipt_date_idx" ON public."StockReceipt" USING btree (date);


--
-- Name: StockReceipt_importType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockReceipt_importType_idx" ON public."StockReceipt" USING btree ("importType");


--
-- Name: StockReceipt_receiptNumber_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockReceipt_receiptNumber_idx" ON public."StockReceipt" USING btree ("receiptNumber");


--
-- Name: StockReceipt_receiptNumber_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "StockReceipt_receiptNumber_key" ON public."StockReceipt" USING btree ("receiptNumber");


--
-- Name: StockReceipt_status_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockReceipt_status_idx" ON public."StockReceipt" USING btree (status);


--
-- Name: StockReceipt_supplierId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockReceipt_supplierId_idx" ON public."StockReceipt" USING btree ("supplierId");


--
-- Name: StockTransaction_createdAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockTransaction_createdAt_idx" ON public."StockTransaction" USING btree ("createdAt");


--
-- Name: StockTransaction_type_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockTransaction_type_idx" ON public."StockTransaction" USING btree (type);


--
-- Name: StockTransferItem_productId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockTransferItem_productId_idx" ON public."StockTransferItem" USING btree ("productId");


--
-- Name: StockTransferItem_transferId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockTransferItem_transferId_idx" ON public."StockTransferItem" USING btree ("transferId");


--
-- Name: StockTransfer_date_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockTransfer_date_idx" ON public."StockTransfer" USING btree (date);


--
-- Name: StockTransfer_fromBranchId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockTransfer_fromBranchId_idx" ON public."StockTransfer" USING btree ("fromBranchId");


--
-- Name: StockTransfer_status_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockTransfer_status_idx" ON public."StockTransfer" USING btree (status);


--
-- Name: StockTransfer_toBranchId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StockTransfer_toBranchId_idx" ON public."StockTransfer" USING btree ("toBranchId");


--
-- Name: StockTransfer_transferNumber_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "StockTransfer_transferNumber_key" ON public."StockTransfer" USING btree ("transferNumber");


--
-- Name: StyleMatching_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StyleMatching_customerId_idx" ON public."StyleMatching" USING btree ("customerId");


--
-- Name: StyleMatching_personalStyle_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StyleMatching_personalStyle_idx" ON public."StyleMatching" USING btree ("personalStyle");


--
-- Name: StylistSignatureStyle_specialties_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StylistSignatureStyle_specialties_idx" ON public."StylistSignatureStyle" USING btree (specialties);


--
-- Name: StylistSignatureStyle_staffId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StylistSignatureStyle_staffId_idx" ON public."StylistSignatureStyle" USING btree ("staffId");


--
-- Name: StylistSignatureStyle_staffId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "StylistSignatureStyle_staffId_key" ON public."StylistSignatureStyle" USING btree ("staffId");


--
-- Name: StylistSupportPanel_bookingId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StylistSupportPanel_bookingId_idx" ON public."StylistSupportPanel" USING btree ("bookingId");


--
-- Name: StylistSupportPanel_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StylistSupportPanel_customerId_idx" ON public."StylistSupportPanel" USING btree ("customerId");


--
-- Name: StylistSupportPanel_isActive_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "StylistSupportPanel_isActive_idx" ON public."StylistSupportPanel" USING btree ("isActive");


--
-- Name: Supplier_code_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "Supplier_code_key" ON public."Supplier" USING btree (code);


--
-- Name: Supplier_isActive_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Supplier_isActive_idx" ON public."Supplier" USING btree ("isActive");


--
-- Name: Supplier_name_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "Supplier_name_idx" ON public."Supplier" USING btree (name);


--
-- Name: TechnicalChecklist_bookingId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "TechnicalChecklist_bookingId_idx" ON public."TechnicalChecklist" USING btree ("bookingId");


--
-- Name: TechnicalChecklist_isCompleted_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "TechnicalChecklist_isCompleted_idx" ON public."TechnicalChecklist" USING btree ("isCompleted");


--
-- Name: TechnicalChecklist_serviceId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "TechnicalChecklist_serviceId_idx" ON public."TechnicalChecklist" USING btree ("serviceId");


--
-- Name: ThresholdRule_productCategory_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ThresholdRule_productCategory_idx" ON public."ThresholdRule" USING btree ("productCategory");


--
-- Name: ThresholdRule_productId_serviceId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "ThresholdRule_productId_serviceId_key" ON public."ThresholdRule" USING btree ("productId", "serviceId");


--
-- Name: ThresholdRule_serviceCategory_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "ThresholdRule_serviceCategory_idx" ON public."ThresholdRule" USING btree ("serviceCategory");


--
-- Name: TierUpgradeHistory_changeType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "TierUpgradeHistory_changeType_idx" ON public."TierUpgradeHistory" USING btree ("changeType");


--
-- Name: TierUpgradeHistory_createdAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "TierUpgradeHistory_createdAt_idx" ON public."TierUpgradeHistory" USING btree ("createdAt");


--
-- Name: TierUpgradeHistory_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "TierUpgradeHistory_customerId_idx" ON public."TierUpgradeHistory" USING btree ("customerId");


--
-- Name: TierUpgradeHistory_membershipId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "TierUpgradeHistory_membershipId_idx" ON public."TierUpgradeHistory" USING btree ("membershipId");


--
-- Name: TrainingExercise_lessonId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "TrainingExercise_lessonId_idx" ON public."TrainingExercise" USING btree ("lessonId");


--
-- Name: TrainingLesson_level_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "TrainingLesson_level_idx" ON public."TrainingLesson" USING btree (level);


--
-- Name: TrainingLesson_moduleId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "TrainingLesson_moduleId_idx" ON public."TrainingLesson" USING btree ("moduleId");


--
-- Name: TrainingLesson_role_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "TrainingLesson_role_idx" ON public."TrainingLesson" USING btree (role);


--
-- Name: TrainingLevel_roleId_level_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "TrainingLevel_roleId_level_key" ON public."TrainingLevel" USING btree ("roleId", level);


--
-- Name: TrainingModule_category_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "TrainingModule_category_idx" ON public."TrainingModule" USING btree (category);


--
-- Name: TrainingModule_role_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "TrainingModule_role_idx" ON public."TrainingModule" USING btree (role);


--
-- Name: TrainingProgress_lessonId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "TrainingProgress_lessonId_idx" ON public."TrainingProgress" USING btree ("lessonId");


--
-- Name: TrainingProgress_levelId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "TrainingProgress_levelId_idx" ON public."TrainingProgress" USING btree ("levelId");


--
-- Name: TrainingProgress_moduleId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "TrainingProgress_moduleId_idx" ON public."TrainingProgress" USING btree ("moduleId");


--
-- Name: TrainingProgress_userId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "TrainingProgress_userId_idx" ON public."TrainingProgress" USING btree ("userId");


--
-- Name: TrainingProgress_userId_levelId_lessonId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "TrainingProgress_userId_levelId_lessonId_key" ON public."TrainingProgress" USING btree ("userId", "levelId", "lessonId");


--
-- Name: TrainingQuiz_lessonId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "TrainingQuiz_lessonId_key" ON public."TrainingQuiz" USING btree ("lessonId");


--
-- Name: TrainingRole_name_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "TrainingRole_name_key" ON public."TrainingRole" USING btree (name);


--
-- Name: TreatmentPlan_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "TreatmentPlan_customerId_idx" ON public."TreatmentPlan" USING btree ("customerId");


--
-- Name: TreatmentPlan_planType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "TreatmentPlan_planType_idx" ON public."TreatmentPlan" USING btree ("planType");


--
-- Name: TreatmentPlan_status_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "TreatmentPlan_status_idx" ON public."TreatmentPlan" USING btree (status);


--
-- Name: TreatmentTracking_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "TreatmentTracking_customerId_idx" ON public."TreatmentTracking" USING btree ("customerId");


--
-- Name: TreatmentTracking_trackedAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "TreatmentTracking_trackedAt_idx" ON public."TreatmentTracking" USING btree ("trackedAt");


--
-- Name: TreatmentTracking_treatmentPlanId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "TreatmentTracking_treatmentPlanId_idx" ON public."TreatmentTracking" USING btree ("treatmentPlanId");


--
-- Name: UpsaleMatrix_serviceId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "UpsaleMatrix_serviceId_idx" ON public."UpsaleMatrix" USING btree ("serviceId");


--
-- Name: UpsaleMatrix_serviceName_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "UpsaleMatrix_serviceName_idx" ON public."UpsaleMatrix" USING btree ("serviceName");


--
-- Name: UpsaleMatrix_upsaleType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "UpsaleMatrix_upsaleType_idx" ON public."UpsaleMatrix" USING btree ("upsaleType");


--
-- Name: UpsaleRecommendation_createdAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "UpsaleRecommendation_createdAt_idx" ON public."UpsaleRecommendation" USING btree ("createdAt");


--
-- Name: UpsaleRecommendation_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "UpsaleRecommendation_customerId_idx" ON public."UpsaleRecommendation" USING btree ("customerId");


--
-- Name: UpsaleRecommendation_serviceId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "UpsaleRecommendation_serviceId_idx" ON public."UpsaleRecommendation" USING btree ("serviceId");


--
-- Name: UpsaleRecommendation_status_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "UpsaleRecommendation_status_idx" ON public."UpsaleRecommendation" USING btree (status);


--
-- Name: UpsaleRecord_createdAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "UpsaleRecord_createdAt_idx" ON public."UpsaleRecord" USING btree ("createdAt");


--
-- Name: UpsaleRecord_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "UpsaleRecord_customerId_idx" ON public."UpsaleRecord" USING btree ("customerId");


--
-- Name: UpsaleRecord_invoiceId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "UpsaleRecord_invoiceId_idx" ON public."UpsaleRecord" USING btree ("invoiceId");


--
-- Name: UpsaleRecord_source_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "UpsaleRecord_source_idx" ON public."UpsaleRecord" USING btree (source);


--
-- Name: UpsaleRecord_staffId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "UpsaleRecord_staffId_idx" ON public."UpsaleRecord" USING btree ("staffId");


--
-- Name: User_phone_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "User_phone_key" ON public."User" USING btree (phone);


--
-- Name: VideoFrame_frameNumber_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VideoFrame_frameNumber_idx" ON public."VideoFrame" USING btree ("frameNumber");


--
-- Name: VideoFrame_timestamp_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VideoFrame_timestamp_idx" ON public."VideoFrame" USING btree ("timestamp");


--
-- Name: VideoFrame_videoId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VideoFrame_videoId_idx" ON public."VideoFrame" USING btree ("videoId");


--
-- Name: VoiceAnalytics_branchId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VoiceAnalytics_branchId_idx" ON public."VoiceAnalytics" USING btree ("branchId");


--
-- Name: VoiceAnalytics_partnerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VoiceAnalytics_partnerId_idx" ON public."VoiceAnalytics" USING btree ("partnerId");


--
-- Name: VoiceAnalytics_periodStart_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VoiceAnalytics_periodStart_idx" ON public."VoiceAnalytics" USING btree ("periodStart");


--
-- Name: VoiceAnalytics_periodType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VoiceAnalytics_periodType_idx" ON public."VoiceAnalytics" USING btree ("periodType");


--
-- Name: VoiceCommand_branchId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VoiceCommand_branchId_idx" ON public."VoiceCommand" USING btree ("branchId");


--
-- Name: VoiceCommand_commandType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VoiceCommand_commandType_idx" ON public."VoiceCommand" USING btree ("commandType");


--
-- Name: VoiceCommand_createdAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VoiceCommand_createdAt_idx" ON public."VoiceCommand" USING btree ("createdAt");


--
-- Name: VoiceCommand_staffId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VoiceCommand_staffId_idx" ON public."VoiceCommand" USING btree ("staffId");


--
-- Name: VoiceCommand_status_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VoiceCommand_status_idx" ON public."VoiceCommand" USING btree (status);


--
-- Name: VoiceIntent_confidence_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VoiceIntent_confidence_idx" ON public."VoiceIntent" USING btree (confidence);


--
-- Name: VoiceIntent_intent_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VoiceIntent_intent_idx" ON public."VoiceIntent" USING btree (intent);


--
-- Name: VoiceIntent_interactionId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VoiceIntent_interactionId_idx" ON public."VoiceIntent" USING btree ("interactionId");


--
-- Name: VoiceIntent_sessionId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VoiceIntent_sessionId_idx" ON public."VoiceIntent" USING btree ("sessionId");


--
-- Name: VoiceInteraction_intent_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VoiceInteraction_intent_idx" ON public."VoiceInteraction" USING btree (intent);


--
-- Name: VoiceInteraction_sequence_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VoiceInteraction_sequence_idx" ON public."VoiceInteraction" USING btree (sequence);


--
-- Name: VoiceInteraction_sessionId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VoiceInteraction_sessionId_idx" ON public."VoiceInteraction" USING btree ("sessionId");


--
-- Name: VoiceInteraction_speaker_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VoiceInteraction_speaker_idx" ON public."VoiceInteraction" USING btree (speaker);


--
-- Name: VoiceInteraction_timestamp_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VoiceInteraction_timestamp_idx" ON public."VoiceInteraction" USING btree ("timestamp");


--
-- Name: VoiceSession_branchId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VoiceSession_branchId_idx" ON public."VoiceSession" USING btree ("branchId");


--
-- Name: VoiceSession_customerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VoiceSession_customerId_idx" ON public."VoiceSession" USING btree ("customerId");


--
-- Name: VoiceSession_partnerId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VoiceSession_partnerId_idx" ON public."VoiceSession" USING btree ("partnerId");


--
-- Name: VoiceSession_sessionType_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VoiceSession_sessionType_idx" ON public."VoiceSession" USING btree ("sessionType");


--
-- Name: VoiceSession_staffId_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VoiceSession_staffId_idx" ON public."VoiceSession" USING btree ("staffId");


--
-- Name: VoiceSession_startedAt_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VoiceSession_startedAt_idx" ON public."VoiceSession" USING btree ("startedAt");


--
-- Name: VoiceSession_status_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "VoiceSession_status_idx" ON public."VoiceSession" USING btree (status);


--
-- Name: _MarketingCampaignToMarketingChannel_AB_unique; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "_MarketingCampaignToMarketingChannel_AB_unique" ON public."_MarketingCampaignToMarketingChannel" USING btree ("A", "B");


--
-- Name: _MarketingCampaignToMarketingChannel_B_index; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "_MarketingCampaignToMarketingChannel_B_index" ON public."_MarketingCampaignToMarketingChannel" USING btree ("B");


--
-- Name: AutomationLog AutomationLog_flowId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."AutomationLog"
    ADD CONSTRAINT "AutomationLog_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES public."AutomationFlow"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Booking Booking_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Booking Booking_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Booking Booking_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Booking Booking_stylistId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_stylistId_fkey" FOREIGN KEY ("stylistId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: BranchForecast BranchForecast_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."BranchForecast"
    ADD CONSTRAINT "BranchForecast_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BranchInventory BranchInventory_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."BranchInventory"
    ADD CONSTRAINT "BranchInventory_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BranchInventory BranchInventory_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."BranchInventory"
    ADD CONSTRAINT "BranchInventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BranchPerformance BranchPerformance_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."BranchPerformance"
    ADD CONSTRAINT "BranchPerformance_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BranchStaffAssignment BranchStaffAssignment_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."BranchStaffAssignment"
    ADD CONSTRAINT "BranchStaffAssignment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BranchStaffAssignment BranchStaffAssignment_staffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."BranchStaffAssignment"
    ADD CONSTRAINT "BranchStaffAssignment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Branch Branch_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Branch"
    ADD CONSTRAINT "Branch_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public."Partner"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Certification Certification_levelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Certification"
    ADD CONSTRAINT "Certification_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES public."TrainingLevel"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Certification Certification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Certification"
    ADD CONSTRAINT "Certification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ColorAnalysis ColorAnalysis_imageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ColorAnalysis"
    ADD CONSTRAINT "ColorAnalysis_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES public."HairStyleImage"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CommissionRecord CommissionRecord_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CommissionRecord"
    ADD CONSTRAINT "CommissionRecord_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CommissionRecord CommissionRecord_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CommissionRecord"
    ADD CONSTRAINT "CommissionRecord_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CommissionRecord CommissionRecord_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CommissionRecord"
    ADD CONSTRAINT "CommissionRecord_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CommissionRecord CommissionRecord_staffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CommissionRecord"
    ADD CONSTRAINT "CommissionRecord_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ConsumptionTracking ConsumptionTracking_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ConsumptionTracking"
    ADD CONSTRAINT "ConsumptionTracking_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ConsumptionTracking ConsumptionTracking_topStaffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ConsumptionTracking"
    ADD CONSTRAINT "ConsumptionTracking_topStaffId_fkey" FOREIGN KEY ("topStaffId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CurlPatternAnalysis CurlPatternAnalysis_imageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CurlPatternAnalysis"
    ADD CONSTRAINT "CurlPatternAnalysis_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES public."HairStyleImage"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CustomerBehavior CustomerBehavior_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerBehavior"
    ADD CONSTRAINT "CustomerBehavior_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CustomerExperience CustomerExperience_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerExperience"
    ADD CONSTRAINT "CustomerExperience_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CustomerInsight CustomerInsight_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerInsight"
    ADD CONSTRAINT "CustomerInsight_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CustomerJourney CustomerJourney_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerJourney"
    ADD CONSTRAINT "CustomerJourney_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CustomerLoyalty CustomerLoyalty_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerLoyalty"
    ADD CONSTRAINT "CustomerLoyalty_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CustomerLoyalty CustomerLoyalty_tierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerLoyalty"
    ADD CONSTRAINT "CustomerLoyalty_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES public."LoyaltyTier"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CustomerMembership CustomerMembership_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerMembership"
    ADD CONSTRAINT "CustomerMembership_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CustomerPersonalityProfile CustomerPersonalityProfile_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerPersonalityProfile"
    ADD CONSTRAINT "CustomerPersonalityProfile_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CustomerPhoto CustomerPhoto_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerPhoto"
    ADD CONSTRAINT "CustomerPhoto_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CustomerPrediction CustomerPrediction_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerPrediction"
    ADD CONSTRAINT "CustomerPrediction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CustomerProfile CustomerProfile_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerProfile"
    ADD CONSTRAINT "CustomerProfile_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CustomerRiskAlert CustomerRiskAlert_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerRiskAlert"
    ADD CONSTRAINT "CustomerRiskAlert_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CustomerTag CustomerTag_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerTag"
    ADD CONSTRAINT "CustomerTag_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CustomerTouchpoint CustomerTouchpoint_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerTouchpoint"
    ADD CONSTRAINT "CustomerTouchpoint_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CustomerTouchpoint CustomerTouchpoint_staffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."CustomerTouchpoint"
    ADD CONSTRAINT "CustomerTouchpoint_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ExerciseSubmission ExerciseSubmission_exerciseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ExerciseSubmission"
    ADD CONSTRAINT "ExerciseSubmission_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES public."TrainingExercise"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExerciseSubmission ExerciseSubmission_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ExerciseSubmission"
    ADD CONSTRAINT "ExerciseSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FollowUpMessage FollowUpMessage_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."FollowUpMessage"
    ADD CONSTRAINT "FollowUpMessage_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: HairDamageMapping HairDamageMapping_videoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."HairDamageMapping"
    ADD CONSTRAINT "HairDamageMapping_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES public."HairAnalysisVideo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: HairElasticityAnalysis HairElasticityAnalysis_videoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."HairElasticityAnalysis"
    ADD CONSTRAINT "HairElasticityAnalysis_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES public."HairAnalysisVideo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: HairFormula HairFormula_imageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."HairFormula"
    ADD CONSTRAINT "HairFormula_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES public."HairStyleImage"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: HairMovementAnalysis HairMovementAnalysis_videoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."HairMovementAnalysis"
    ADD CONSTRAINT "HairMovementAnalysis_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES public."HairAnalysisVideo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: HairStyleAnalysis HairStyleAnalysis_imageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."HairStyleAnalysis"
    ADD CONSTRAINT "HairStyleAnalysis_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES public."HairStyleImage"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: HairSurfaceAnalysis HairSurfaceAnalysis_videoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."HairSurfaceAnalysis"
    ADD CONSTRAINT "HairSurfaceAnalysis_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES public."HairAnalysisVideo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: HairVideoRecommendation HairVideoRecommendation_videoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."HairVideoRecommendation"
    ADD CONSTRAINT "HairVideoRecommendation_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES public."HairAnalysisVideo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InventoryProjection InventoryProjection_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."InventoryProjection"
    ADD CONSTRAINT "InventoryProjection_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InvoiceItem InvoiceItem_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InvoiceItem InvoiceItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: InvoiceItem InvoiceItem_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Invoice Invoice_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public."Booking"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Invoice Invoice_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Invoice Invoice_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: KPISummary KPISummary_staffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."KPISummary"
    ADD CONSTRAINT "KPISummary_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: License License_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."License"
    ADD CONSTRAINT "License_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public."Partner"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Location Location_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Location"
    ADD CONSTRAINT "Location_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LossAlert LossAlert_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."LossAlert"
    ADD CONSTRAINT "LossAlert_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LossAlert LossAlert_staffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."LossAlert"
    ADD CONSTRAINT "LossAlert_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LoyaltyPoint LoyaltyPoint_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."LoyaltyPoint"
    ADD CONSTRAINT "LoyaltyPoint_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LoyaltyPoint LoyaltyPoint_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."LoyaltyPoint"
    ADD CONSTRAINT "LoyaltyPoint_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MarketingAutomation MarketingAutomation_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."MarketingAutomation"
    ADD CONSTRAINT "MarketingAutomation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public."MarketingCampaign"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MarketingContent MarketingContent_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."MarketingContent"
    ADD CONSTRAINT "MarketingContent_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public."MarketingCampaign"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MarketingDataPoint MarketingDataPoint_channelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."MarketingDataPoint"
    ADD CONSTRAINT "MarketingDataPoint_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES public."MarketingChannel"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MarketingLog MarketingLog_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."MarketingLog"
    ADD CONSTRAINT "MarketingLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public."MarketingCampaign"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MarketingLog MarketingLog_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."MarketingLog"
    ADD CONSTRAINT "MarketingLog_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MixLog MixLog_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."MixLog"
    ADD CONSTRAINT "MixLog_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MixLog MixLog_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."MixLog"
    ADD CONSTRAINT "MixLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MixLog MixLog_staffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."MixLog"
    ADD CONSTRAINT "MixLog_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OperationLog OperationLog_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."OperationLog"
    ADD CONSTRAINT "OperationLog_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OperationLog OperationLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."OperationLog"
    ADD CONSTRAINT "OperationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PartnerPerformance PartnerPerformance_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."PartnerPerformance"
    ADD CONSTRAINT "PartnerPerformance_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public."Partner"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PartnerQualityScore PartnerQualityScore_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."PartnerQualityScore"
    ADD CONSTRAINT "PartnerQualityScore_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public."Partner"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PointsTransaction PointsTransaction_membershipId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."PointsTransaction"
    ADD CONSTRAINT "PointsTransaction_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES public."CustomerMembership"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductStock ProductStock_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ProductStock"
    ADD CONSTRAINT "ProductStock_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductStock ProductStock_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ProductStock"
    ADD CONSTRAINT "ProductStock_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."Location"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ProductStock ProductStock_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ProductStock"
    ADD CONSTRAINT "ProductStock_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Reminder Reminder_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Reminder"
    ADD CONSTRAINT "Reminder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RestockRecommendation RestockRecommendation_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."RestockRecommendation"
    ADD CONSTRAINT "RestockRecommendation_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RestockRecommendation RestockRecommendation_projectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."RestockRecommendation"
    ADD CONSTRAINT "RestockRecommendation_projectionId_fkey" FOREIGN KEY ("projectionId") REFERENCES public."InventoryProjection"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: RestockTrigger RestockTrigger_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."RestockTrigger"
    ADD CONSTRAINT "RestockTrigger_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RewardRedemption RewardRedemption_membershipId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."RewardRedemption"
    ADD CONSTRAINT "RewardRedemption_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES public."CustomerMembership"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RewardRedemption RewardRedemption_rewardId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."RewardRedemption"
    ADD CONSTRAINT "RewardRedemption_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES public."RewardCatalog"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RoleplaySession RoleplaySession_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."RoleplaySession"
    ADD CONSTRAINT "RoleplaySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SalaryPayout SalaryPayout_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."SalaryPayout"
    ADD CONSTRAINT "SalaryPayout_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SalaryPayout SalaryPayout_staffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."SalaryPayout"
    ADD CONSTRAINT "SalaryPayout_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ServiceCost ServiceCost_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ServiceCost"
    ADD CONSTRAINT "ServiceCost_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ServiceCost ServiceCost_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ServiceCost"
    ADD CONSTRAINT "ServiceCost_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ServiceProductUsage ServiceProductUsage_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ServiceProductUsage"
    ADD CONSTRAINT "ServiceProductUsage_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ServiceProductUsage ServiceProductUsage_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."ServiceProductUsage"
    ADD CONSTRAINT "ServiceProductUsage_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SimulationSession SimulationSession_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."SimulationSession"
    ADD CONSTRAINT "SimulationSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SkillAssessment SkillAssessment_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."SkillAssessment"
    ADD CONSTRAINT "SkillAssessment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SkillAssessment SkillAssessment_staffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."SkillAssessment"
    ADD CONSTRAINT "SkillAssessment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SkillProgress SkillProgress_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."SkillProgress"
    ADD CONSTRAINT "SkillProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StaffDailyRecord StaffDailyRecord_staffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StaffDailyRecord"
    ADD CONSTRAINT "StaffDailyRecord_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StaffSalaryProfile StaffSalaryProfile_staffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StaffSalaryProfile"
    ADD CONSTRAINT "StaffSalaryProfile_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StaffService StaffService_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StaffService"
    ADD CONSTRAINT "StaffService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StaffService StaffService_staffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StaffService"
    ADD CONSTRAINT "StaffService_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES public."Staff"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StaffShift StaffShift_staffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StaffShift"
    ADD CONSTRAINT "StaffShift_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES public."Staff"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Staff Staff_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Staff"
    ADD CONSTRAINT "Staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockIssueItem StockIssueItem_issueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StockIssueItem"
    ADD CONSTRAINT "StockIssueItem_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES public."StockIssue"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockIssueItem StockIssueItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StockIssueItem"
    ADD CONSTRAINT "StockIssueItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockIssue StockIssue_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StockIssue"
    ADD CONSTRAINT "StockIssue_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockIssue StockIssue_staffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StockIssue"
    ADD CONSTRAINT "StockIssue_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StockLog StockLog_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StockLog"
    ADD CONSTRAINT "StockLog_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockLog StockLog_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StockLog"
    ADD CONSTRAINT "StockLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockReceiptItem StockReceiptItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StockReceiptItem"
    ADD CONSTRAINT "StockReceiptItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockReceiptItem StockReceiptItem_receiptId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StockReceiptItem"
    ADD CONSTRAINT "StockReceiptItem_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES public."StockReceipt"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockReceipt StockReceipt_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StockReceipt"
    ADD CONSTRAINT "StockReceipt_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockReceipt StockReceipt_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StockReceipt"
    ADD CONSTRAINT "StockReceipt_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StockTransaction StockTransaction_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StockTransaction"
    ADD CONSTRAINT "StockTransaction_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockTransaction StockTransaction_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StockTransaction"
    ADD CONSTRAINT "StockTransaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockTransferItem StockTransferItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StockTransferItem"
    ADD CONSTRAINT "StockTransferItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockTransferItem StockTransferItem_transferId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StockTransferItem"
    ADD CONSTRAINT "StockTransferItem_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES public."StockTransfer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockTransfer StockTransfer_fromBranchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StockTransfer"
    ADD CONSTRAINT "StockTransfer_fromBranchId_fkey" FOREIGN KEY ("fromBranchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockTransfer StockTransfer_toBranchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StockTransfer"
    ADD CONSTRAINT "StockTransfer_toBranchId_fkey" FOREIGN KEY ("toBranchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StylistSignatureStyle StylistSignatureStyle_staffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."StylistSignatureStyle"
    ADD CONSTRAINT "StylistSignatureStyle_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TierUpgradeHistory TierUpgradeHistory_membershipId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."TierUpgradeHistory"
    ADD CONSTRAINT "TierUpgradeHistory_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES public."CustomerMembership"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TrainingExercise TrainingExercise_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."TrainingExercise"
    ADD CONSTRAINT "TrainingExercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."TrainingLesson"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TrainingLesson TrainingLesson_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."TrainingLesson"
    ADD CONSTRAINT "TrainingLesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public."TrainingModule"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TrainingLevel TrainingLevel_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."TrainingLevel"
    ADD CONSTRAINT "TrainingLevel_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."TrainingRole"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TrainingProgress TrainingProgress_levelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."TrainingProgress"
    ADD CONSTRAINT "TrainingProgress_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES public."TrainingLevel"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TrainingProgress TrainingProgress_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."TrainingProgress"
    ADD CONSTRAINT "TrainingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TrainingQuizResult TrainingQuizResult_quizId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."TrainingQuizResult"
    ADD CONSTRAINT "TrainingQuizResult_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES public."TrainingQuiz"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TrainingQuizResult TrainingQuizResult_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."TrainingQuizResult"
    ADD CONSTRAINT "TrainingQuizResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TrainingQuiz TrainingQuiz_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."TrainingQuiz"
    ADD CONSTRAINT "TrainingQuiz_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."TrainingLesson"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UpsaleRecommendation UpsaleRecommendation_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."UpsaleRecommendation"
    ADD CONSTRAINT "UpsaleRecommendation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UpsaleRecord UpsaleRecord_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."UpsaleRecord"
    ADD CONSTRAINT "UpsaleRecord_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: User User_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public."Partner"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: VideoFrame VideoFrame_videoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."VideoFrame"
    ADD CONSTRAINT "VideoFrame_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES public."HairAnalysisVideo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Visit Visit_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Visit"
    ADD CONSTRAINT "Visit_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: VoiceInteraction VoiceInteraction_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."VoiceInteraction"
    ADD CONSTRAINT "VoiceInteraction_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public."VoiceSession"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _MarketingCampaignToMarketingChannel _MarketingCampaignToMarketingChannel_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."_MarketingCampaignToMarketingChannel"
    ADD CONSTRAINT "_MarketingCampaignToMarketingChannel_A_fkey" FOREIGN KEY ("A") REFERENCES public."MarketingCampaign"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _MarketingCampaignToMarketingChannel _MarketingCampaignToMarketingChannel_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."_MarketingCampaignToMarketingChannel"
    ADD CONSTRAINT "_MarketingCampaignToMarketingChannel_B_fkey" FOREIGN KEY ("B") REFERENCES public."MarketingChannel"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TABLE "AbandonedCart"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."AbandonedCart" TO ctssuser;


--
-- Name: TABLE "AutomationFlow"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."AutomationFlow" TO ctssuser;


--
-- Name: TABLE "AutomationLog"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."AutomationLog" TO ctssuser;


--
-- Name: TABLE "Booking"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."Booking" TO ctssuser;


--
-- Name: TABLE "Branch"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."Branch" TO ctssuser;


--
-- Name: TABLE "BranchForecast"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."BranchForecast" TO ctssuser;


--
-- Name: TABLE "BranchInventory"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."BranchInventory" TO ctssuser;


--
-- Name: TABLE "BranchPerformance"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."BranchPerformance" TO ctssuser;


--
-- Name: TABLE "BranchStaffAssignment"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."BranchStaffAssignment" TO ctssuser;


--
-- Name: TABLE "COGSCalculation"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."COGSCalculation" TO ctssuser;


--
-- Name: TABLE "Cashflow"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."Cashflow" TO ctssuser;


--
-- Name: TABLE "Certification"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."Certification" TO ctssuser;


--
-- Name: TABLE "ChemicalHistoryRisk"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."ChemicalHistoryRisk" TO ctssuser;


--
-- Name: TABLE "ColorAnalysis"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."ColorAnalysis" TO ctssuser;


--
-- Name: TABLE "ColorRecommendation"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."ColorRecommendation" TO ctssuser;


--
-- Name: TABLE "CommissionRecord"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."CommissionRecord" TO ctssuser;


--
-- Name: TABLE "CompetitorAnalysis"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."CompetitorAnalysis" TO ctssuser;


--
-- Name: TABLE "ConsistencyMetrics"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."ConsistencyMetrics" TO ctssuser;


--
-- Name: TABLE "ConsumptionTracking"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."ConsumptionTracking" TO ctssuser;


--
-- Name: TABLE "ContentLibrary"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."ContentLibrary" TO ctssuser;


--
-- Name: TABLE "CorrectionSuggestion"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."CorrectionSuggestion" TO ctssuser;


--
-- Name: TABLE "CrossBranchQuality"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."CrossBranchQuality" TO ctssuser;


--
-- Name: TABLE "CurlPatternAnalysis"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."CurlPatternAnalysis" TO ctssuser;


--
-- Name: TABLE "Customer"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."Customer" TO ctssuser;


--
-- Name: TABLE "CustomerBehavior"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."CustomerBehavior" TO ctssuser;


--
-- Name: TABLE "CustomerExperience"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."CustomerExperience" TO ctssuser;


--
-- Name: TABLE "CustomerInsight"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."CustomerInsight" TO ctssuser;


--
-- Name: TABLE "CustomerJourney"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."CustomerJourney" TO ctssuser;


--
-- Name: TABLE "CustomerLoyalty"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."CustomerLoyalty" TO ctssuser;


--
-- Name: TABLE "CustomerMembership"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."CustomerMembership" TO ctssuser;


--
-- Name: TABLE "CustomerPersonalityProfile"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."CustomerPersonalityProfile" TO ctssuser;


--
-- Name: TABLE "CustomerPhoto"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."CustomerPhoto" TO ctssuser;


--
-- Name: TABLE "CustomerPrediction"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."CustomerPrediction" TO ctssuser;


--
-- Name: TABLE "CustomerProfile"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."CustomerProfile" TO ctssuser;


--
-- Name: TABLE "CustomerRiskAlert"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."CustomerRiskAlert" TO ctssuser;


--
-- Name: TABLE "CustomerStyleHistory"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."CustomerStyleHistory" TO ctssuser;


--
-- Name: TABLE "CustomerTag"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."CustomerTag" TO ctssuser;


--
-- Name: TABLE "CustomerTouchpoint"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."CustomerTouchpoint" TO ctssuser;


--
-- Name: TABLE "DailyReport"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."DailyReport" TO ctssuser;


--
-- Name: TABLE "DamageLevelAssessment"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."DamageLevelAssessment" TO ctssuser;


--
-- Name: TABLE "DynamicPricing"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."DynamicPricing" TO ctssuser;


--
-- Name: TABLE "ErrorDetection"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."ErrorDetection" TO ctssuser;


--
-- Name: TABLE "ExerciseSubmission"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."ExerciseSubmission" TO ctssuser;


--
-- Name: TABLE "Expense"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."Expense" TO ctssuser;


--
-- Name: TABLE "FaceAnalysis"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."FaceAnalysis" TO ctssuser;


--
-- Name: TABLE "FinancialForecast"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."FinancialForecast" TO ctssuser;


--
-- Name: TABLE "FinancialMetric"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."FinancialMetric" TO ctssuser;


--
-- Name: TABLE "FinancialRiskAlert"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."FinancialRiskAlert" TO ctssuser;


--
-- Name: TABLE "FollowUpMessage"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."FollowUpMessage" TO ctssuser;


--
-- Name: TABLE "HQNotification"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."HQNotification" TO ctssuser;


--
-- Name: TABLE "HairAnalysisVideo"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."HairAnalysisVideo" TO ctssuser;


--
-- Name: TABLE "HairConditionAnalysis"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."HairConditionAnalysis" TO ctssuser;


--
-- Name: TABLE "HairDamageMapping"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."HairDamageMapping" TO ctssuser;


--
-- Name: TABLE "HairElasticityAnalysis"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."HairElasticityAnalysis" TO ctssuser;


--
-- Name: TABLE "HairFormula"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."HairFormula" TO ctssuser;


--
-- Name: TABLE "HairHealthScan"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."HairHealthScan" TO ctssuser;


--
-- Name: TABLE "HairMovementAnalysis"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."HairMovementAnalysis" TO ctssuser;


--
-- Name: TABLE "HairProcedure"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."HairProcedure" TO ctssuser;


--
-- Name: TABLE "HairSimulation"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."HairSimulation" TO ctssuser;


--
-- Name: TABLE "HairStyleAnalysis"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."HairStyleAnalysis" TO ctssuser;


--
-- Name: TABLE "HairStyleImage"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."HairStyleImage" TO ctssuser;


--
-- Name: TABLE "HairSurfaceAnalysis"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."HairSurfaceAnalysis" TO ctssuser;


--
-- Name: TABLE "HairVideoRecommendation"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."HairVideoRecommendation" TO ctssuser;


--
-- Name: TABLE "HairstyleRecommendation"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."HairstyleRecommendation" TO ctssuser;


--
-- Name: TABLE "InventoryProjection"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."InventoryProjection" TO ctssuser;


--
-- Name: TABLE "Invoice"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."Invoice" TO ctssuser;


--
-- Name: TABLE "InvoiceItem"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."InvoiceItem" TO ctssuser;


--
-- Name: TABLE "KPISummary"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."KPISummary" TO ctssuser;


--
-- Name: TABLE "License"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."License" TO ctssuser;


--
-- Name: TABLE "LossAlert"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."LossAlert" TO ctssuser;


--
-- Name: TABLE "LoyaltyPoint"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."LoyaltyPoint" TO ctssuser;


--
-- Name: TABLE "LoyaltyPrediction"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."LoyaltyPrediction" TO ctssuser;


--
-- Name: TABLE "LoyaltyTier"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."LoyaltyTier" TO ctssuser;


--
-- Name: TABLE "MarketingAutomation"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."MarketingAutomation" TO ctssuser;


--
-- Name: TABLE "MarketingCampaign"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."MarketingCampaign" TO ctssuser;


--
-- Name: TABLE "MarketingChannel"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."MarketingChannel" TO ctssuser;


--
-- Name: TABLE "MarketingContent"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."MarketingContent" TO ctssuser;


--
-- Name: TABLE "MarketingDataPoint"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."MarketingDataPoint" TO ctssuser;


--
-- Name: TABLE "MarketingLog"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."MarketingLog" TO ctssuser;


--
-- Name: TABLE "MarketingSegment"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."MarketingSegment" TO ctssuser;


--
-- Name: TABLE "MarketingTrend"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."MarketingTrend" TO ctssuser;


--
-- Name: TABLE "MembershipMetric"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."MembershipMetric" TO ctssuser;


--
-- Name: TABLE "MembershipTier"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."MembershipTier" TO ctssuser;


--
-- Name: TABLE "MinaMemory"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."MinaMemory" TO ctssuser;


--
-- Name: TABLE "MixLog"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."MixLog" TO ctssuser;


--
-- Name: TABLE "MonthlyReport"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."MonthlyReport" TO ctssuser;


--
-- Name: TABLE "Notification"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."Notification" TO ctssuser;


--
-- Name: TABLE "OperationLog"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."OperationLog" TO ctssuser;


--
-- Name: TABLE "Partner"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."Partner" TO ctssuser;


--
-- Name: TABLE "PartnerPerformance"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."PartnerPerformance" TO ctssuser;


--
-- Name: TABLE "PartnerQualityScore"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."PartnerQualityScore" TO ctssuser;


--
-- Name: TABLE "PeakHourDetection"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."PeakHourDetection" TO ctssuser;


--
-- Name: TABLE "PersonalizationMetric"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."PersonalizationMetric" TO ctssuser;


--
-- Name: TABLE "PersonalizedFollowUp"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."PersonalizedFollowUp" TO ctssuser;


--
-- Name: TABLE "PersonalizedRecommendation"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."PersonalizedRecommendation" TO ctssuser;


--
-- Name: TABLE "PointsTransaction"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."PointsTransaction" TO ctssuser;


--
-- Name: TABLE "PorosityElasticityAnalysis"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."PorosityElasticityAnalysis" TO ctssuser;


--
-- Name: TABLE "PostServiceAudit"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."PostServiceAudit" TO ctssuser;


--
-- Name: TABLE "PricingHistory"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."PricingHistory" TO ctssuser;


--
-- Name: TABLE "PricingOptimization"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."PricingOptimization" TO ctssuser;


--
-- Name: TABLE "PricingRule"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."PricingRule" TO ctssuser;


--
-- Name: TABLE "Product"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."Product" TO ctssuser;


--
-- Name: TABLE "ProductCategory"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."ProductCategory" TO ctssuser;


--
-- Name: TABLE "ProductStock"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."ProductStock" TO ctssuser;


--
-- Name: TABLE "ProfitCalculation"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."ProfitCalculation" TO ctssuser;


--
-- Name: TABLE "QualityScore"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."QualityScore" TO ctssuser;


--
-- Name: TABLE "Reminder"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."Reminder" TO ctssuser;


--
-- Name: TABLE "RestockRecommendation"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."RestockRecommendation" TO ctssuser;


--
-- Name: TABLE "RestockTrigger"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."RestockTrigger" TO ctssuser;


--
-- Name: TABLE "Revenue"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."Revenue" TO ctssuser;


--
-- Name: TABLE "RewardCatalog"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."RewardCatalog" TO ctssuser;


--
-- Name: TABLE "RewardRedemption"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."RewardRedemption" TO ctssuser;


--
-- Name: TABLE "RoleplaySession"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."RoleplaySession" TO ctssuser;


--
-- Name: TABLE "SOP"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."SOP" TO ctssuser;


--
-- Name: TABLE "SOPEnforcement"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."SOPEnforcement" TO ctssuser;


--
-- Name: TABLE "SalaryPayout"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."SalaryPayout" TO ctssuser;


--
-- Name: TABLE "SalesFunnel"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."SalesFunnel" TO ctssuser;


--
-- Name: TABLE "ScalpConditionAnalysis"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."ScalpConditionAnalysis" TO ctssuser;


--
-- Name: TABLE "Service"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."Service" TO ctssuser;


--
-- Name: TABLE "ServiceCost"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."ServiceCost" TO ctssuser;


--
-- Name: TABLE "ServiceProductUsage"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."ServiceProductUsage" TO ctssuser;


--
-- Name: TABLE "ServiceSOP"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."ServiceSOP" TO ctssuser;


--
-- Name: TABLE "SimulationSession"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."SimulationSession" TO ctssuser;


--
-- Name: TABLE "SkillAssessment"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."SkillAssessment" TO ctssuser;


--
-- Name: TABLE "SkillProgress"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."SkillProgress" TO ctssuser;


--
-- Name: TABLE "SmartDiscount"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."SmartDiscount" TO ctssuser;


--
-- Name: TABLE "StaffDailyRecord"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."StaffDailyRecord" TO ctssuser;


--
-- Name: TABLE "StaffSalaryProfile"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."StaffSalaryProfile" TO ctssuser;


--
-- Name: TABLE "StockLog"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."StockLog" TO ctssuser;


--
-- Name: TABLE "StockTransaction"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."StockTransaction" TO ctssuser;


--
-- Name: TABLE "StyleMatching"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."StyleMatching" TO ctssuser;


--
-- Name: TABLE "StylistAnalysis"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."StylistAnalysis" TO ctssuser;


--
-- Name: TABLE "StylistSignatureStyle"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."StylistSignatureStyle" TO ctssuser;


--
-- Name: TABLE "StylistSupportPanel"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."StylistSupportPanel" TO ctssuser;


--
-- Name: TABLE "TechnicalChecklist"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."TechnicalChecklist" TO ctssuser;


--
-- Name: TABLE "ThresholdRule"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."ThresholdRule" TO ctssuser;


--
-- Name: TABLE "TierUpgradeHistory"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."TierUpgradeHistory" TO ctssuser;


--
-- Name: TABLE "TrainingExercise"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."TrainingExercise" TO ctssuser;


--
-- Name: TABLE "TrainingLesson"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."TrainingLesson" TO ctssuser;


--
-- Name: TABLE "TrainingLevel"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."TrainingLevel" TO ctssuser;


--
-- Name: TABLE "TrainingModule"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."TrainingModule" TO ctssuser;


--
-- Name: TABLE "TrainingProgress"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."TrainingProgress" TO ctssuser;


--
-- Name: TABLE "TrainingQuiz"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."TrainingQuiz" TO ctssuser;


--
-- Name: TABLE "TrainingQuizResult"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."TrainingQuizResult" TO ctssuser;


--
-- Name: TABLE "TrainingRole"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."TrainingRole" TO ctssuser;


--
-- Name: TABLE "TreatmentPlan"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."TreatmentPlan" TO ctssuser;


--
-- Name: TABLE "TreatmentTracking"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."TreatmentTracking" TO ctssuser;


--
-- Name: TABLE "UpsaleMatrix"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."UpsaleMatrix" TO ctssuser;


--
-- Name: TABLE "UpsaleRecommendation"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."UpsaleRecommendation" TO ctssuser;


--
-- Name: TABLE "UpsaleRecord"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."UpsaleRecord" TO ctssuser;


--
-- Name: TABLE "User"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."User" TO ctssuser;


--
-- Name: TABLE "VideoFrame"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."VideoFrame" TO ctssuser;


--
-- Name: TABLE "Visit"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."Visit" TO ctssuser;


--
-- Name: TABLE "VoiceAnalytics"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."VoiceAnalytics" TO ctssuser;


--
-- Name: TABLE "VoiceCommand"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."VoiceCommand" TO ctssuser;


--
-- Name: TABLE "VoiceIntent"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."VoiceIntent" TO ctssuser;


--
-- Name: TABLE "VoiceInteraction"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."VoiceInteraction" TO ctssuser;


--
-- Name: TABLE "VoiceSession"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."VoiceSession" TO ctssuser;


--
-- Name: TABLE "WorkflowError"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."WorkflowError" TO ctssuser;


--
-- Name: TABLE "WorkflowRun"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."WorkflowRun" TO ctssuser;


--
-- Name: TABLE "_MarketingCampaignToMarketingChannel"; Type: ACL; Schema: public; Owner: user
--

GRANT ALL ON TABLE public."_MarketingCampaignToMarketingChannel" TO ctssuser;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: user
--

ALTER DEFAULT PRIVILEGES FOR ROLE "user" IN SCHEMA public GRANT ALL ON TABLES  TO "user";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: ctssuser
--

ALTER DEFAULT PRIVILEGES FOR ROLE ctssuser IN SCHEMA public GRANT ALL ON TABLES  TO ctssuser;


--
-- PostgreSQL database dump complete
--

