<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Saved addresses for the logged-in customer (all routes are auth:sanctum).
 * Every query is scoped to the current user, so nobody can read or change another
 * customer's address.
 */
class AddressController extends Controller
{
    private function rules(): array
    {
        return [
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'mobile'     => 'required|string|max:20',
            'country'    => 'required|string|max:100',
            'state'      => 'nullable|string|max:100|required_if:country,India',
            'city'       => 'required|string|max:100',
            'pincode'    => 'required|string|max:20',
            'address'    => 'nullable|string|max:255',
            'is_default' => 'sometimes|boolean',
        ];
    }

    private function mine(Request $request, $id): Address
    {
        return Address::where('user_id', $request->user()->id)->findOrFail($id);
    }

    // GET /addresses  (default first)
    public function index(Request $request): JsonResponse
    {
        $list = Address::where('user_id', $request->user()->id)
            ->orderByDesc('is_default')
            ->latest('id')
            ->get();

        return response()->json(['data' => $list]);
    }

    // POST /addresses
    public function store(Request $request): JsonResponse
    {
        $data   = $request->validate($this->rules());
        $userId = $request->user()->id;

        $address = DB::transaction(function () use ($data, $userId) {
            $isFirst   = !Address::where('user_id', $userId)->exists();
            $isDefault = $isFirst || !empty($data['is_default']);

            if ($isDefault) {
                Address::where('user_id', $userId)->update(['is_default' => false]);
            }

            return Address::create($data + ['user_id' => $userId, 'is_default' => $isDefault]);
        });

        return response()->json(['data' => $address], 201);
    }

    // PUT /addresses/{id}
    public function update(Request $request, $id): JsonResponse
    {
        $address = $this->mine($request, $id);
        $data    = $request->validate($this->rules());

        DB::transaction(function () use ($address, $data, $request) {
            if (!empty($data['is_default'])) {
                Address::where('user_id', $request->user()->id)->update(['is_default' => false]);
            } else {
                unset($data['is_default']);   // never un-default here; set another one as default instead
            }
            $address->update($data);
        });

        return response()->json(['data' => $address->fresh()]);
    }

    // POST /addresses/{id}/default
    public function setDefault(Request $request, $id): JsonResponse
    {
        $address = $this->mine($request, $id);

        DB::transaction(function () use ($address, $request) {
            Address::where('user_id', $request->user()->id)->update(['is_default' => false]);
            $address->update(['is_default' => true]);
        });

        return response()->json(['data' => $address->fresh()]);
    }

    // DELETE /addresses/{id}
    public function destroy(Request $request, $id): JsonResponse
    {
        $address    = $this->mine($request, $id);
        $wasDefault = $address->is_default;
        $userId     = $request->user()->id;

        $address->delete();

        // keep one default if any address is left
        if ($wasDefault) {
            Address::where('user_id', $userId)->latest('id')->first()?->update(['is_default' => true]);
        }

        return response()->json(['message' => 'Address deleted.']);
    }
}