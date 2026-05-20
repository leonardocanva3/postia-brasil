"use client";

import { useMemo, useState } from "react";

type SegmentOption = Readonly<{
  id: string;
  name: string;
}>;

type SpecialtyOption = Readonly<{
  id: string;
  segmentId: string;
  name: string;
}>;

type BusinessSegmentSelectsProps = Readonly<{
  segments: SegmentOption[];
  specialties: SpecialtyOption[];
  defaultSegmentId?: string | null;
  defaultSpecialtyId?: string | null;
}>;

export function BusinessSegmentSelects({
  segments,
  specialties,
  defaultSegmentId,
  defaultSpecialtyId
}: BusinessSegmentSelectsProps) {
  const [segmentId, setSegmentId] = useState(defaultSegmentId ?? "");
  const [specialtyId, setSpecialtyId] = useState(defaultSpecialtyId ?? "");
  const filteredSpecialties = useMemo(
    () =>
      segmentId
        ? specialties.filter((specialty) => specialty.segmentId === segmentId)
        : [],
    [segmentId, specialties]
  );

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <label className="block">
        <span className="text-sm font-medium text-gray-800">
          Segmento principal
        </span>
        <select
          className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          name="businessSegmentId"
          onChange={(event) => {
            setSegmentId(event.target.value);
            setSpecialtyId("");
          }}
          value={segmentId}
        >
          <option value="">Selecione um segmento</option>
          {segments.map((segment) => (
            <option key={segment.id} value={segment.id}>
              {segment.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-medium text-gray-800">Especialidade</span>
        <select
          className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-gray-100"
          disabled={!segmentId}
          name="businessSpecialtyId"
          onChange={(event) => setSpecialtyId(event.target.value)}
          value={specialtyId}
        >
          <option value="">Selecione uma especialidade</option>
          {filteredSpecialties.map((specialty) => (
            <option key={specialty.id} value={specialty.id}>
              {specialty.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
